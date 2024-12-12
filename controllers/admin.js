function getAdminPanel(req, res) {
    if (req.session?.user?.isAdmin) {
        return res.render("control-panel", { title: "پنل مدیریت" });
    }
    res.redirect("/");
}

module.exports = { getAdminPanel };