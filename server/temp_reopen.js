/**
 * @desc    Reopen chat room (Admin)
 * @route   PATCH /api/support-chat/admin/reopen/:id
 * @access  Private/Admin
 */
export const reopenChatRoom = async (req, res, next) => {
    try {
        const room = await ChatRoom.findByIdAndUpdate(
            req.params.id,
            {
                status: "active",
                closed_at: null,
                unread_count_user: 0,
                unread_count_admin: 0,
            },
            { new: true }
        )
            .populate("user_id", "full_name email")
            .populate("admin_id", "full_name email");

        if (!room) {
            return res.status(404).json({
                success: false,
                message: "Chat room not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Chat room reopened successfully",
            data: room,
        });
    } catch (error) {
        if (error.kind === "ObjectId") {
            return res.status(404).json({
                success: false,
                message: "Chat room not found",
            });
        }
        next(error);
    }
};
