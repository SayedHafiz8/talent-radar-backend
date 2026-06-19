import asyncHandler from "express-async-handler";

import AppError from "../utils/appError.js";
import ApiFeature from "../utils/apiFeatures.js";
import { model } from "mongoose";


export const creating = (model, field = null) => {
    return asyncHandler(async(req, res, next)=>{
        if(field){
            req.body[field] = req.user._id;
        }
        console.log(model.schema.path("coach").options.ref)
        const document = await model.create(req.body);
        res.status(201).json({
            status: "Success",
            data: {
                document
            }
        })
    })
}

export const gettingAll = (model, refFiled = null) => {
    return asyncHandler(async(req, res, next) => {
        
        const documentCount = await model.countDocuments();
        const features = new ApiFeature(model.find(), req.query, req.params, req.user)
        .filter(refFiled)
        .sort()
        .limitFields()
        .search()
        .paginate(documentCount);

        const {query, pagination} = features
        const documents = await query
        if(!documents){
            return next(new AppError(`No documents yet`, 404));
        }
        res.status(200).json({
            status: "Success",
            count: documents.length,
            pagination,
            data: {
                documents
            }
        })
    })
}

export const gettingSpecific = (model) => {
    return asyncHandler(async(req, res, next) => {
        const {id} = req.params;
        const document = await model.findById(id);
        if(!document){
            return next(new AppError(`No document for this Id '${id}'`, 404));
        }
        res.status(200).json({
            status: "Success",
            data: {
                document
            }
        })
    })
}

export const updating = (model) => {
    return asyncHandler(async (req,res, next) => {
        
        const body = req.body;
        const id = req.params.id;
        const document = await model.findByIdAndUpdate(id, body, {returnDocument :"after", runValidators: true})
        if(!document){
            return next(new AppError(`No model for This Id: ${id}`))
        }
        res.status(200).json({
            status: "Success",
            data: {
                document
            }
        })


    })
}

export const softDelete = (model) => {
    return asyncHandler(async(req, res, next)=> {
        const id = req.params.id;
        const document = await model.findByIdAndUpdate(id, {
        active: false,
        }, {returnDocument :"after", runValidators: true})
        if(!document){
            return next(new AppError(`No ${model} for This Id: ${id}`))
        }
        res.status(204).json({
            status: "success"
        })
    })
}

export const restoring = (model) => {
    return asyncHandler(async (req, res, next) =>{
        const id = req.params.id;
        const document = await model.findByIdAndUpdate(id, {
        active: true,
        }, {returnDocument :"after", runValidators: true}).setOptions({ bypassFilter: true });

        if(!document){
            return next(new AppError(`No model for This Id: ${id}`))
        }
        res.status(200).json({
            status: "Success",
            data: {
                hotel: document
            }
        })
    })
}

export const deleteOne = (model) => asyncHandler(async(req ,res, next) => {
    const {id} = req.params;
    const document = await model.findByIdAndDelete(id);
    if(!document){
        return next(new AppError(`No ${model} for This Id: ${id}`))
    }
    res.status(204).json({
        status: "success"
    })
})