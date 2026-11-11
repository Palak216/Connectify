exports.deleteComment = async (req, res) => {
    try {
        // your delete logic here
        res.status(200).json({ message: 'Comment deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
