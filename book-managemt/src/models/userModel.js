import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
    {
        title: { type: String, required: 'Book Title Required', enum: ['Mr', 'Mrs', 'Miss'], trim: true },
        name: { type: String, required: 'Book Name Required', trim: true },
        phone: { type: String, required: 'Book Phone Required', trim: true },
        email: { type: String, required: 'Book Email Required', unique: true, trim: true },  //valid email
        password: { type: String, required: 'Book Password Required', minlength: 8, maxlength: 15, trim: true },
        address: {
            street: { type: String, required: 'Book Street Required', trim: true },
            city: { type: String, required: 'Book City Required', trim: true },
            pincode: { type: String, required: 'Book Pincode Required', minlength: 6, trim: true }
        }
    },
    { timestamps: true }
)

export default mongoose.model('User', userSchema)
