import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
//import bcrypt from 'bcrypt';
import {
  isValidBody,
  isValidEnum,
  isValidNumber,
  isValidPwd,
  isValidStr,
  isValidEmail
} from "../util/userValidate.js";

//POST /register
//By Richard
const createUser = async (req, res) => {

  try {
    const reqBody = req.body
    const { title, name, phone, email, password } = reqBody

    if (isValidBody(reqBody))
      return res.status(400).send({ status: false, message: "Enter user details" });

    if (!title)
      return res.status(400).send({ status: false, message: "title is  mandatory" });

    if (isValidEnum(title))
      return res.status(400).send({ status: false, msg: "Title should be from enum [ Mr/Mrs/Miss]" });

    if (!name)
      return res.status(400).send({ status: false, message: "name is  mandatory" });

    if (isValidStr(name))
      return res.status(400).send({ status: false, msg: "name should be only string " });

    if (!phone)
      return res.status(400).send({ status: false, message: "phone is  mandatory" });

    if (isValidNumber(phone))
      return res.status(400).send({ status: false, message: " please enter 10 digit IND mobile number", });

      let uniquePhoneNo = await userModel.findOne({ phone: phone });

      if (uniquePhoneNo)
        return res.status(400).send({ status: false, message: "PhoneNo should be  unique" });

    if (!phone)
      return res.status(400).send({ status: false, message: "Phone is  mandatory" });
    
    if (!email)
      return res.status(400).send({ status: false, message: "Email is  mandatory" });

    if (!isValidEmail(email))
      return res.status(400).send({ status: false, msg: `your Email-Id '${email}' is invalid` });

    if (isValidNumber(phone))
      return res.status(400).send({ status: false, message: " Please enter 10 digit IND mobile number", });

    if (!password)
      return res.status(400).send({ status: false, message: "password is  mandatory" });

    if (!email)
      return res.status(400).send({ status: false, message: "Email is  mandatory" });

    if (!isValidEmail(email))
      return res.status(400).send({ status: false, msg: `Your Email-Id ${email}is invalid` });

    const uniqueEmail = await userModel.findOne({ email: email });
    
    if (uniqueEmail)
      return res.status(400).send({ status: false, message: "Email already registered Please Sign-In" });

    if (!password)
      return res.status(400).send({ status: false, message: "password is  mandatory" });

    if (!isValidPwd(password))
      return res.status(400).send({ status: false, message: "Password should be minLen 8, maxLen 15 & must contain one of 0-9,A-Z,a-z & special char" });

    //  let saltRounds=10
    //  const hash = bcrypt.hashSync(password, saltRounds);
    //  reqBody.password = hash

    const result = await userModel.create(reqBody);

    return res.status(201).send({ status: true, message: "Registration done Successfully", data: result });

  }
  
  catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};


//========================POST /login===============================

const userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (Object.keys(req.body).length == 0)
      return res.status(400).send({ status: false, message: "Enter Login Credentials." });

    if (!email)
      return res.status(400).send({ status: false, msg: "Email Required." });

    if (!password)
      return res.status(400).send({ status: false, msg: "Password Required." });

    if (!isValidEmail(email))
      return res.status(400).send({ status: false, msg: `your Email-Id ${email} is invalid` });

    if (!isValidPwd(password))
      return res.status(400).send({ status: false, essage: "Password should be minLen 8, maxLen 15 long and must contain one of 0-9,A-Z,a-z & special char", });

    const user = await userModel.findOne({ email: email, password: password }).select({ _id: 1 });

    if (!user)
      return res.status(401).send({ status: false, message: "Authentication failed!!!, Incorrect Email or Password !!!" });

    const payload = { userId: user._id, iat: Math.floor(Date.now() / 1000) };
    const token = jwt.sign(payload, "group56", { expiresIn: "24h" });

    return res.status(200).send({ status: true, message: "Login Successfully", token: token, exp: payload.exp, });

  } catch (err) {
    res.status(500).send({ status: false, message: err.message });
  }
};

export { createUser, userLogin };
