import mongoose from "mongoose";

const PurchaseSchema = new mongoose.Schema({
    courseId:{type:mongoose.Schema.Types.ObjectId,
        ref:'course',
        required:true

    },
    userId:{
        type:String,
        ref:'User',
        required:true
    },
    amount:{type:Number,required:true},
    status:{type:String,enum:['pending','completed','failed'],default:'pending'},
    paymentMethod:{type:String,enum:['stripe','manual'],default:'stripe'},
    paymentStatus:{type:String,enum:['pending','verified','rejected'],default:'pending'},
    manualPaymentDetails:{
        email:{type:String},
        phoneNumber:{type:String},
        location:{type:String},
        selectedBank:{type:String},
        screenshotUrl:{type:String}
    }

},{timestamps:true})

export const Purchase=mongoose.model('Purchase',PurchaseSchema) 