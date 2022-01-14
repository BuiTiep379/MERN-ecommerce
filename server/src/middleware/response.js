const { StatusCodes } = require('http-status-codes');

const message = {
    GET: "Get completed",
    CREATE: "Create completed",
    UPDATE: "Update completed",
    DELETE: "Delete completed",
    UNAUTHENTICATE: "Sign in is required",
    UNAUTHORIZE: "Not allowed to access",
};

const Response = (res, data, httpStatus = StatusCodes.OK) => {
    return res.status(httpStatus).json(data);
};

const Get = (res, data) => {
    return Response(
        res,
        { message: message.GET, data },
        StatusCodes.OK
    )
};
const Create = (res, data) => {
    return Response(
        res,
        { message: message.CREATE, data },
        StatusCodes.CREATED
    )
};
const Update = (res, data) => {
    return Response(res, {
        message: message.UPDATE,
        data,
    });
};

const Delete = (res, data) => {
    return Response(res, {
        message: message.DELETE,
        data,
    });
};
const ServerError = (res, error) => {
    return Response(res, { error }, StatusCodes.INTERNAL_SERVER_ERROR);
};
// yeu cau signin
const Unauthenticated = (res, error) => {
    return Response(res, { error }, StatusCodes.UNAUTHORIZED);
};
// ko cho phep
const Unauthorized = (res) => {
    return Response(res, { message: message.UNAUTHORIZE }, StatusCodes.FORBIDDEN);
};

const BadRequest = (res, error) => {
    return Response(res, { error }, StatusCodes.BAD_REQUEST);
};

const NotFound = (res, input) => {
    return Response(res, { message: `${input} not found` }, StatusCodes.NOT_FOUND);
};

const flat = (data) => {
    return Object.keys(data).map((key) => data[key])[0];
};
module.exports = {
    Response,
    Get,
    Create,
    Update,
    Delete,
    BadRequest,
    Unauthenticated,
    Unauthorized,
    NotFound,
    ServerError,
};