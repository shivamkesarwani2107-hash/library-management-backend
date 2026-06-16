import express from "express";
import bcrypt from "bcryptjs";
import Validation from "../backend/validation.js";
import "../backend/mongoose.js";
import User from "../backend/schema.js";
import Book from "../backend/book.js";
import jwt from "jsonwebtoken"
import cors from "cors";
const app = express();
app.use(cors());
app.use(express.json());

app.get("/", async (req, resp) => {

    const users = await User.find();

    resp.send(users);

});

app.get("/profile", async (req, resp) => {
    const authHeader =
        req.headers.authorization;

    if (!authHeader) {
        return resp.status(401).send({
            message: "Token required"
        });
    }

    const token =
        authHeader.split(" ")[1];
    const decoded = jwt.verify(
        token,
        "acessscret"
    );
    const user = await User.findById(
        decoded.id
    );
    resp.send({
        name: user.name,
        email: user.email
    });
});

app.post("/signup", async (req, resp) => {
    try {

        const { error } = Validation.validate(req.body);

        if (error) {
            return resp.status(400).send({
                message: error.details[0].message
            });
        }

        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return resp.status(400).send({
                message: "All fields are required"
            });
        }

        const existingUser = await User.findOne({
            email
        });

        if (existingUser) {
            return resp.status(400).send({
                message: "Email already exist"
            })
        }

        const hashedPassword = await bcrypt.hash(
            password,
            10
        );

        const newUser = new User({
            name,
            email,
            password: hashedPassword
        });
        await newUser.save();
        resp.status(201).send({
            message: "Signup Successfully"
        })
    } catch (err) {
        resp.status(500).send({
            message: "Server Error",
            error: err.message
        });
    }
});

app.post("/login", async (req, resp) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return resp.status(400).send({
                message: "All fields are required"
            });
        }

        const user = await User.findOne({
            email
        });

        if (!user) {
            return resp.status(404).send({
                message: "User not found"
            });
        }

        const match = await bcrypt.compare(
            password,
            user.password
        );

        if (!match) {
            return resp.status(401).send({
                message: "Inavlid Password"
            });
        }

        const accessToken = jwt.sign(
            {
                id: user._id,
                email: user.email
            },
            "acessscret",
            {
                expiresIn: "15d"
            }
        );

        const refreshToken = jwt.sign(
            {
                id: user._id
            },
            "refreshsecret",
            {
                expiresIn: "30d"
            }
        )

        resp.status(200).send({
            message: "Login Successfully",
            accessToken,
            refreshToken
        });

    } catch (err) {
        resp.status(500).send({
            message: "server error",
            error: err.message
        });
    }
});

app.post("/book", async (req, resp) => {
    const { title, author, category } = req.body;

    if (!title || !author || !category) {
        return resp.status(400).send({
            message: "All fields are required"
        });
    }
    const book = new Book({
        title,
        author,
        category
    });

    await book.save();

    resp.send({
        message: "Book Added"
    });

});

app.get("/book", async (req, resp) => {

    const page =
        Number(req.query.page) || 1;

    const limit =
        Number(req.query.limit) || 3;

    const search =
        req.query.search || "";

    const sort =
        req.query.sort || "";

    let query =
        Book.find({
            title: {
                $regex: search,
                $options: "i"
            }
        });

    if (sort === "asc") {

        query = query.sort({
            title: 1
        });
    }
    if (sort === "desc") {

        query = query.sort({
            title: -1
        });

    }

    const books =
        await query
            .skip((page - 1) * limit)
            .limit(limit);

    resp.send(books);

});


app.get("/wishlist", async (req, resp) => {

    const authHeader =
        req.headers.authorization;

    if (!authHeader) {

        return resp.status(401).send({
            message: "Token Required"
        });

    }

    const token =
        authHeader.split(" ")[1];

    const decoded =
        jwt.verify(
            token,
            "acessscret"
        );

    const userId =
        decoded.id;

    const books =
        await Book.find({
            wishlistBy: userId
        });

    resp.send(books);

});

app.delete("/book/:id", async (req, resp) => {
    await Book.findByIdAndDelete(
        req.params.id
    );
    resp.send({
        message: "BOOK DELETED SUCCESSFULLY"
    });
});

app.post("/book", async (req, resp) => {

    const { title, author } = req.body;

    const book = new Book({
        title,
        author
    });

    await book.save();

    resp.send({
        message: "Book Added"
    });

});

app.put("/book/:id", async (req, resp) => {

    const { title, author } = req.body;

    await Book.findByIdAndUpdate(
        req.params.id,
        {
            title,
            author
        }
    );

    resp.send({
        message: "Book Updated Successfully"
    });

});


app.put("/wishlist/:id", async (req, resp) => {

    const authHeader = req.headers.authorization;

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(
        token,
        "acessscret"
    );

    const userId = decoded.id;

    const book = await Book.findById(
        req.params.id
    );

    if (book.wishlistBy.includes(userId)) {

        return resp.send({
            message: "Already in Wishlist"
        });

    }

    await Book.findByIdAndUpdate(
        req.params.id,
        {
            $addToSet: {
                wishlistBy: userId
            }
        }
    );

    resp.send({
        message: "Added To Wishlist"
    });

});

app.get("/book/:id", async (req, resp) => {

    const book =
        await Book.findById(
            req.params.id
        );

    resp.send(book);

});

app.listen(4000, () => {
    console.log("SERVER IS RUNNING ON PORT 4000")
})