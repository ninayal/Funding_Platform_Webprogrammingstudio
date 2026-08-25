"use strict";

const PasswordResetRequests = require("./schemas/PasswordResetRequest");

const toIso = (value) => (value ? new Date(value).toISOString() : null);

const toRuntimeRequest = (request) => {
  if (!request) {
    return null;
  }

  return {
    ...request,
    id: String(request._id),
    requestedAt: toIso(request.requestedAt),
    resolvedAt: toIso(request.resolvedAt),
  };
};

const getAllRequests = async () => {
  const requests = await PasswordResetRequests.find().lean();
  return requests.map(toRuntimeRequest);
};

const getPendingRequests = async () => {
  const requests = await PasswordResetRequests.find({ status: "pending" })
    .sort({ requestedAt: 1 })
    .lean();

  return requests.map(toRuntimeRequest);
};

const getResolvedRequests = async (limit = 10) => {
  const requests = await PasswordResetRequests.find({ status: { $ne: "pending" } })
    .sort({ resolvedAt: -1 })
    .limit(limit)
    .lean();

  return requests.map(toRuntimeRequest);
};

const createRequest = async (email) => {
  const request = await PasswordResetRequests.create({
    _id: `req_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    email,
    status: "pending",
    requestedAt: new Date(),
    resolvedAt: null,
    tempPassword: null,
  });

  return toRuntimeRequest(request.toObject());
};

const findRequestById = async (id) => {
  if (!id) {
    return null;
  }

  return toRuntimeRequest(
    await PasswordResetRequests.findById(String(id)).lean()
  );
};

const resolveRequest = async (id, tempPassword) => {
  const request = await PasswordResetRequests.findByIdAndUpdate(
    String(id),
    {
      $set: {
        status: "resolved",
        resolvedAt: new Date(),
        tempPassword,
      },
    },
    { new: true }
  ).lean();

  return toRuntimeRequest(request);
};

const rejectRequest = async (id) => {
  const request = await PasswordResetRequests.findByIdAndUpdate(
    String(id),
    {
      $set: {
        status: "rejected",
        resolvedAt: new Date(),
      },
    },
    { new: true }
  ).lean();

  return toRuntimeRequest(request);
};

const deleteRequest = async (id) => {
  const request = await PasswordResetRequests.findByIdAndDelete(String(id)).lean();
  return toRuntimeRequest(request);
};

module.exports = {
  getAllRequests,
  getPendingRequests,
  getResolvedRequests,
  createRequest,
  findRequestById,
  resolveRequest,
  rejectRequest,
  deleteRequest,
};
