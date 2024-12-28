const bcrypt = require("bcryptjs");
const User = require("../models/User");

function isAuthenticated(req) {
    if (!req.session.user)
        return false;
    return true;
}

function comparePassword(plain, hashed) {
    const isMatch = bcrypt.compareSync(plain, hashed);
    return isMatch;
}

function getLogin(req, res) {
    if (!isAuthenticated(req))
        return res.render("login", { title: "ورود کاربر" });
    res.redirect("/");
}

async function loginHandler(req, res) {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user)
        return res.render("login", { message: "! کاربری یافت نشد !", title: "ورود کاربر" });

    const admin = await User.findOne({ username: "admin" });
    if (admin && comparePassword(password, admin.password)) {
        req.session.user = { ...admin._doc, isAdmin: true };
        return res.redirect("/cpanel");
    } else if (comparePassword(password, user.password)) {
        req.session.user = user;
        res.redirect("/");
    }
    else {
        res.render("login", { message: "! کاربری یافت نشد !", title: "ورود کاربر" });
    }
}

function logoutHandler(req, res) {
    if (req.session.user) {
        req.session.destroy(er => {
            if (!er) {
                return res.redirect("/login");
            } else {
                console.error(er);
            }
        });
    } else {
        res.redirect("/");
    }
}

function getRegister(req, res) {
    if (!isAuthenticated(req))
        return res.render("register", { title: "ثبت نام" });
    res.redirect("/");
}

async function registerHandler(req, res) {
    const { username, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
        return res.render("register", { title: 'ثبت نام', message: "! کلمه عبور با تکرار کلمه عبور مطابقت ندارد !", username });
    }

    const user = await User.findOne({ username });
    if (user)
        return res.render("register", { title: 'ثبت نام', message: "! نام کاربری استفاده شده است !" });

    const encryptedPassword = bcrypt.hashSync(password, 10);
    const createdUser = new User({ username, password: encryptedPassword });
    await createdUser.save();
    res.render("login", { title: 'ورود کاربر' });
}

module.exports = {
    getLogin,
    loginHandler,
    logoutHandler,
    getRegister,
    registerHandler
};