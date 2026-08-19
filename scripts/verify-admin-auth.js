"use strict";

/*
 * Self-cleaning smoke test for the requireAdmin gate + login
 * session-regenerate fix. Run with: node scripts/verify-admin-auth.js
 *
 * It temporarily adds two throwaway accounts (test-admin@example.com /
 * test-user@example.com, password "Test1234!") to data/users.json,
 * boots the app in-process, exercises the auth flow over HTTP, then
 * restores the original users.json no matter what happens.
 */

const path = require("path");
const fs = require("fs");

const projectRoot = path.join(__dirname, "..");
const usersFile = path.join(projectRoot, "data", "users.json");
const backup = fs.readFileSync(usersFile, "utf-8");

const { hashPassword } = require(path.join(projectRoot, "utils", "passwordUtils"));

const TEST_PASSWORD = "Test1234!";

async function main() {
  const users = JSON.parse(backup);
  const passwordHash = hashPassword(TEST_PASSWORD);

  users.push(
    {
      id: "test-admin",
      username: "test_admin",
      email: "test-admin@example.com",
      passwordHash,
      role: "admin",
      status: "active",
      joinDate: "2026-01-01",
      requiresPasswordChange: false,
    },
    {
      id: "test-user",
      username: "test_user",
      email: "test-user@example.com",
      passwordHash,
      role: "user",
      status: "active",
      joinDate: "2026-01-01",
      requiresPasswordChange: false,
    }
  );

  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));

  const app = require(path.join(projectRoot, "app.js"));

  const server = app.listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  const port = server.address().port;
  const base = `http://127.0.0.1:${port}`;

  const results = [];
  const check = (label, condition, detail) => {
    results.push({ label, pass: Boolean(condition), detail });
  };

  const getCookie = (res) => (res.headers.get("set-cookie") || "").split(";")[0];

  try {
    // 1. Anonymous visitor hitting /shared/admin must NOT get the admin page.
    const anonRes = await fetch(`${base}/shared/admin`, { redirect: "manual" });
    check(
      "Anonymous GET /shared/admin is blocked",
      anonRes.status === 302 || anonRes.status === 403,
      `status=${anonRes.status}`
    );

    // 2. Log in as a non-admin user, then confirm /shared/admin is 403.
    const userLoginRes = await fetch(`${base}/shared/login`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ email: "test-user@example.com", password: TEST_PASSWORD }),
      redirect: "manual",
    });
    const userCookie = getCookie(userLoginRes);
    check(
      "Non-admin login redirects to /shared/profile",
      userLoginRes.status === 302 && userLoginRes.headers.get("location") === "/shared/profile",
      `status=${userLoginRes.status} location=${userLoginRes.headers.get("location")}`
    );

    const userAdminRes = await fetch(`${base}/shared/admin`, {
      headers: { Cookie: userCookie },
      redirect: "manual",
    });
    check(
      "Logged-in non-admin GET /shared/admin -> 403",
      userAdminRes.status === 403,
      `status=${userAdminRes.status}`
    );

    // 3. Session-fixation check: pretend an attacker planted a known session
    //    cookie on the victim's browser *before* login (this is the actual
    //    attack session.regenerate() defends against). If the server reuses
    //    that attacker-supplied id after authenticating, the fix isn't
    //    working; if it issues a brand new id, the fix works.
    const attackerPlantedCookie = "langco.sid=s%3Aattacker-planted-session-id.fixation";

    const adminLoginRes = await fetch(`${base}/shared/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Cookie: attackerPlantedCookie,
      },
      body: new URLSearchParams({ email: "test-admin@example.com", password: TEST_PASSWORD }),
      redirect: "manual",
    });
    const adminCookie = getCookie(adminLoginRes);

    check(
      "Admin login redirects to /shared/admin",
      adminLoginRes.status === 302 && adminLoginRes.headers.get("location") === "/shared/admin",
      `status=${adminLoginRes.status} location=${adminLoginRes.headers.get("location")}`
    );

    check(
      "Post-login session id differs from attacker-planted id (regenerate ran)",
      adminCookie && !adminCookie.includes("attacker-planted-session-id"),
      `attacker-planted=${attackerPlantedCookie} post-login=${adminCookie}`
    );

    const adminAdminRes = await fetch(`${base}/shared/admin`, {
      headers: { Cookie: adminCookie },
      redirect: "manual",
    });
    check(
      "Logged-in admin GET /shared/admin -> 200",
      adminAdminRes.status === 200,
      `status=${adminAdminRes.status}`
    );

    // 4. Sanity check the login endpoint still responds normally (nothing
    //    else got broken by the regenerate change).
    const sanityRes = await fetch(`${base}/shared/login`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ email: "nobody@example.com", password: "wrong" }),
      redirect: "manual",
    });
    check(
      "Login endpoint still responds normally for other flows",
      sanityRes.status === 200,
      `status=${sanityRes.status}`
    );
  } finally {
    server.close();
    fs.writeFileSync(usersFile, backup);
  }

  console.log("\n=== Verification results ===");
  let allPass = true;
  for (const r of results) {
    console.log(`${r.pass ? "PASS" : "FAIL"} - ${r.label} (${r.detail})`);
    if (!r.pass) allPass = false;
  }
  console.log(allPass ? "\nAll checks passed." : "\nSome checks FAILED.");
  process.exit(allPass ? 0 : 1);
}

main().catch((error) => {
  fs.writeFileSync(usersFile, backup);
  console.error("Verification script crashed:", error);
  process.exit(1);
});
