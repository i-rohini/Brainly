"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const zod_1 = require("zod");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = require("./db");
const config_1 = require("./config");
const middleware_1 = require("./middleware");
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.post("/api/v1/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //zod validation
    const requiredBody = zod_1.z.object({
        username: zod_1.z.string().min(4).max(20),
        password: zod_1.z.string().min(4).max(20)
    });
    const parsedDataWithSuccess = requiredBody.safeParse(req.body);
    if (!parsedDataWithSuccess.success) {
        res.status(403).json({
            message: "Incorrect Format",
            error: parsedDataWithSuccess.error
        });
        return;
    }
    ;
    const username = req.body.username;
    const password = req.body.password;
    const hashedPassword = yield bcrypt_1.default.hash(password, 5);
    try {
        yield db_1.UserModel.create({
            username: username,
            password: hashedPassword
        });
        res.json({
            message: "User signed up"
        });
    }
    catch (e) {
        res.status(411).json({
            message: "User already exists"
        });
    }
}));
app.post("/api/v1/signin", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const requiredBody = zod_1.z.object({
        username: zod_1.z.string().min(4).max(20),
        password: zod_1.z.string().min(4).max(20)
    });
    const parsedDataWithSuccess = requiredBody.safeParse(req.body);
    if (!parsedDataWithSuccess.success) {
        res.status(403).json({
            message: "Incorrect Format",
            error: parsedDataWithSuccess.error
        });
        return;
    }
    ;
    const username = req.body.username;
    const password = req.body.password;
    const existingUser = yield db_1.UserModel.findOne({
        username: username
    });
    if (!existingUser) {
        res.status(403).json({
            messsage: "User does not exit in our db"
        });
        return;
    }
    ;
    const passwordMatch = yield bcrypt_1.default.compare(password, existingUser.password);
    if (passwordMatch) {
        const token = jsonwebtoken_1.default.sign({
            id: existingUser._id
        }, config_1.JWT_PASSWORD);
        res.json({
            token: token
        });
    }
    else {
        res.status(403).json({
            message: "incorrect credentials"
        });
    }
}));
app.post("/api/v1/content", middleware_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const link = req.body.link;
    const title = req.body.title;
    yield db_1.ContentModel.create({
        link: link,
        title: title,
        //@ts-ignore
        userId: req.userId,
        tags: []
    });
    res.json({
        message: "Content added"
    });
}));
app.get("/api/v1/content", middleware_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //@ts-ignore
    const userId = req.userId;
    const content = db_1.ContentModel.find({
        userId: userId
    }); //.populate("userId", "username")
    res.json({
        content
    });
    res.status(500).json({
        error: "error"
    });
}));
app.delete("/api/v1/content", middleware_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const contentId = req.body.contentId;
    yield db_1.ContentModel.deleteMany({
        contentId,
        // @ts-ignore
        userId: req.userId
    });
    res.json({
        message: "Deleted"
    });
}));
app.post("/api/v1/brain/share", (req, res) => {
});
app.get("/api/v1/brain/:shareLink", (req, res) => {
});
app.listen(3000);
