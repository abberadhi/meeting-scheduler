module.exports = {
    register (req, res) {
        res.send({
            message: `your user ${req.body.email} registered, fun!` 
        })
    }
}