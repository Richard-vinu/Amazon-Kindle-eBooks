import mongoose from 'mongoose'
import moment from 'moment'

// ------------dataValidation-----------
const dataValidation = (data) => {
    if (Object.keys(data).length != 0)
        return true
    return false
}

//--------------------mongoDbId------------------------
const isValidObjectId = (id) => {
    return mongoose.Types.ObjectId.isValid(id)
};

//-----------------------phone-------------------------
const isValidPhone = (mobile) => {
    const ph = mobile.trim()
    if (typeof ph == "string" && ph.match(/^[ 0-9 ]{10,10}$/))
        return true
    return false
}
// -----------------------------------email-------------------------------------
const isValidEmail = (email) => {
    if (typeof email == "string" && email.match(/^([a-z0-9_.]+@[a-z]+\.[a-z]{2,3})?$/))
        return true
    return false
}

//--------------------------------------password----------------------------------------
const isValidPass = (password) => {
    const regx = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,99}$/.test(password)
    return regx
};

//-----------------isValidTitleEnum--------------------
const isValidTitleEnum = (title) => {
    return ["Mr", "Mrs", "Miss"].indexOf(title) !== -1
};

//---------------------------------------validText-------------------------------------------
const isValidText = (text) => {
    if (typeof text == "string" && text.trim().length != 0 && text.match(/^[a-z A-Z 0-9,.-?]{2,}$/i))
        return true
    return false
}
const isTitleAny= (text) => {
    if (typeof text == "string" && text.trim().length != 0 && text.match(/^[a-z A-Z 0-9,.-?]{2,}$/i)) 
        return true
    return false
}

//----------------------------------------name--------------------------------------------
const isValidName = (name) => {
    if ((typeof name == "string" && name.trim().length != 0 && name.match(/^[A-Z a-z]{2,}$/)))
        return true
    return false
};
//-------------------------------reviews----------------------------
const isValidReviews = (review) => {
    const rev = review.trim()
    if (typeof rev == "string" && rev.trim().length != 0)
        return true
    return false
}
//-------------------------------ISBN----------------------------
const isValidIsbn = (value) => {
    const isbn = value.trim()
    if (typeof isbn == "string" && isbn.match(/^(?=(?:\D*\d){10}(?:(?:\D*\d){3})?$)[\d-]+$/))
        return true
    return false
}
//=============================body checking =================================>
const isValidBody = function (value) {
    if (typeof value === "undefined" || value === null) return false;
    if (typeof value === "string" && value.trim().length === 0) return false;
    return true;
}

const isValidDate = (reviewedAt) => {
    let value = reviewedAt;
    let check = moment(value,'YYYY-MM-DD', true).isValid();
            return check
};

const isValidRating = (rating) => {
    let value = /^([1-5]|1[05])$/
    if (value.test(rating))
        return false
    return true
}

const isValidTitle = (title)=>{
    var firstChar = title.substring(0, 1);

if (firstChar == firstChar.toUpperCase()) 
return false
return true
    

}

export {
    dataValidation,
    isValidObjectId,
    isValidPhone,
    isValidEmail,
    isValidPass,
    isValidTitleEnum,
    isValidText,
    isValidName,
    isValidReviews,
    isValidIsbn,
    isValidBody,
    isValidDate,
    isValidTitle,
    isValidRating,
    isTitleAny
}
