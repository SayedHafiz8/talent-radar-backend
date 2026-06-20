import asyncHandler from "express-async-handler";

import AppError from "../utils/appError.js";
import ApiFeature from "../utils/apiFeatures.js";

// helper بسيط بيطبق populate لو موجود، عشان متكررش نفس الـ if في كل دالة
const applyPopulate = (query, populateOptions) => {
    if (!populateOptions) return query;

    if (Array.isArray(populateOptions)) {
        populateOptions.forEach((opt) => {
            query = query.populate(opt);
        });
    } else {
        query = query.populate(populateOptions);
    }

    return query;
};

export const creating = (model, field = null, populateOptions = null) => {
    return asyncHandler(async (req, res, next) => {
        if (field) {
            req.body[field] = req.user._id;
        }

        let document = await model.create(req.body);

        if (populateOptions) {
            document = await applyPopulate(model.findById(document._id), populateOptions);
        }

        res.status(201).json({
            status: "Success",
            data: {
                document,
            },
        });
    });
};

export const gettingAll = (model, refFiled = null, searchFields = [], populateOptions = null) => {
    return asyncHandler(async (req, res, next) => {
        const features = new ApiFeature(model.find(), req.query, req.params, req.user)
            .filter(refFiled)
            .search(searchFields)

        const documentCount = await model.countDocuments(
            features.query.getFilter()
        );

        features.sort().limitFields().paginate(documentCount);

        const { query, pagination } = features;

        const finalQuery = applyPopulate(query, populateOptions);
        const documents = await finalQuery;

        if (!documents) {
            return next(new AppError(`No documents yet`, 404));
        }
        res.status(200).json({
            status: "Success",
            count: documents.length,
            pagination,
            data: {
                documents,
            },
        });
    });
};

export const gettingSpecific = (model, populateOptions = null) => {
    return asyncHandler(async (req, res, next) => {
        const { id } = req.params;

        const query = applyPopulate(model.findById(id), populateOptions);
        const document = await query;

        if (!document) {
            return next(new AppError(`No document for this Id '${id}'`, 404));
        }
        res.status(200).json({
            status: "Success",
            data: {
                document,
            },
        });
    });
};

export const updating = (model, populateOptions = null) => {
    return asyncHandler(async (req, res, next) => {
        const body = req.body;
        const id = req.params.id;

        const query = model.findByIdAndUpdate(id, body, {
            returnDocument: "after",
            runValidators: true,
        });

        const document = await applyPopulate(query, populateOptions);

        if (!document) {
            return next(new AppError(`No document for This Id: ${id}`, 404));
        }
        res.status(200).json({
            status: "Success",
            data: {
                document,
            },
        });
    });
};

export const softDelete = (model) => {
    return asyncHandler(async (req, res, next) => {
        const id = req.params.id;
        const document = await model.findByIdAndUpdate(
            id,
            {
                active: false,
            },
            { returnDocument: "after", runValidators: true }
        );
        if (!document) {
            return next(new AppError(`No document for This Id: ${id}`, 404));
        }
        res.status(204).json({
            status: "success",
        });
    });
};

export const restoring = (model, populateOptions = null) => {
    return asyncHandler(async (req, res, next) => {
        const id = req.params.id;

        const query = model
            .findByIdAndUpdate(
                id,
                {
                    active: true,
                },
                { returnDocument: "after", runValidators: true }
            )
            .setOptions({ bypassFilter: true });

        const document = await applyPopulate(query, populateOptions);

        if (!document) {
            return next(new AppError(`No document for This Id: ${id}`, 404));
        }
        res.status(200).json({
            status: "Success",
            data: {
                document,
            },
        });
    });
};

export const deleteOne = (model) =>
    asyncHandler(async (req, res, next) => {
        const { id } = req.params;
        const document = await model.findByIdAndDelete(id);
        if (!document) {
            return next(new AppError(`No document for This Id: ${id}`, 404));
        }
        res.status(204).json({
            status: "success",
        });
    });