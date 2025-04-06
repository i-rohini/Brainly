import express from "express";
import { z } from "zod";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { ContentModel, UserModel } from "./db";
import { JWT_PASSWORD } from "./config";
import { userMiddleware } from "./middleware";

const app = express();
app.use(express.json());

app.post("/api/v1/signup", async (req, res) => {
  //zod validation
  const requiredBody = z.object({
    username: z.string().min(4).max(20),
    password: z.string().min(4).max(20)
  });

  const parsedDataWithSuccess = requiredBody.safeParse(req.body);
  
  if (!parsedDataWithSuccess.success) {
    res.status(403).json({
      message: "Incorrect Format",
      error: parsedDataWithSuccess.error
    })
    return
  };

  const username = req.body.username;
  const password = req.body.password;

  const hashedPassword = await bcrypt.hash(password, 5);

  try {
    await UserModel.create({
      username: username,
      password: hashedPassword
    })

    res.json({
      message: "User signed up"
    })
  }catch (e) {
    res.status(411).json({
      message: "User already exists"
    })
  }
})

app.post("/api/v1/signin", async (req, res) => {
  const requiredBody = z.object({
    username: z.string().min(4).max(20),
    password: z.string().min(4).max(20)
  });

  const parsedDataWithSuccess = requiredBody.safeParse(req.body);
  
  if (!parsedDataWithSuccess.success) {
    res.status(403).json({
      message: "Incorrect Format",
      error: parsedDataWithSuccess.error
    })
    return
  };

  const username = req.body.username;
  const password = req.body.password;

  const existingUser = await UserModel.findOne({
      username: username
  });

  if (!existingUser) {
    res.status(403).json({
      messsage: "User does not exit in our db"
    })
    return
  }; 
  
  const passwordMatch = await bcrypt.compare(password, existingUser.password!);

  if (passwordMatch) {
    const token = jwt.sign({
      id: existingUser._id
    }, JWT_PASSWORD);

    res.json({
      token: token
    })
  } else {
    res.status(403).json({
      message: "incorrect credentials"
    })
  }
})

app.post("/api/v1/content", userMiddleware, async (req, res) => {
  const link = req.body.link;
  const title = req.body.title;
  await ContentModel.create({
    link: link,
    title: title,
    //@ts-ignore
    userId: req.userId,
    tags: []
  })
  res.json({
    message: "Content added"
  })
})

app.get("/api/v1/content", userMiddleware, async (req, res) => {
  //@ts-ignore
  const userId = req.userId;

  const content = ContentModel.find({
    userId: userId
  })//.populate("userId", "username")

  res.json({
    content
  })
})

app.delete("/api/v1/content", userMiddleware, async (req, res) => {
  const contentId = req.body.contentId;
  await ContentModel.deleteMany({
    contentId,
    // @ts-ignore
    userId: req.userId
  })
  res.json({
    message: "Deleted"
  })
})

app.post("/api/v1/brain/share", (req, res) => {
  
})

app.get("/api/v1/brain/:shareLink", (req, res) => {
  
})

app.listen(3000);
