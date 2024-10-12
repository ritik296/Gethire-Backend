const BlogModel = require("../Model/BlogModel");
const cloudinary = require("../Middleware/Cloudinary");
const {
  successResponse,
  errorResponse,
  internalServerError,
  notFoundError,
  validationError,
} = require("../Middleware/responseMiddlewares");

const createBlog = async (req, res) => {
  try {
    const blogData = req.body;
    let image;
    if (req.files && req.files.image && req.files.image[0]) {
      const uploadedFile = await cloudinary.uploader.upload(
        req.files.image[0].path,
        {
          folder: "GetHire",
        }
      );
      if (uploadedFile) {
        image = uploadedFile.secure_url;
      }
    }
    const blog = new BlogModel(blogData);
    await blog.save();
    return successResponse(res, blog, "Blog created successfully");
  } catch (error) {
    return internalServerError(res, "Error creating blog");
  }
};

// Read a blog post by ID
const getBlogs = async (req, res) => {
  try {
    const blog = await BlogModel.find().populate("likes comments.user");
    if (!blog) return notFoundError(res, "Blog not found");
    return successResponse(res, blog, "Blog retrieved successfully");
  } catch (error) {
    return internalServerError(res, "Error retrieving blog");
  }
};

// Read a blog post by ID
const getBlog = async (req, res) => {
  try {
    const blog = await BlogModel.findById(req.params.id).populate(
      "likes comments.user"
    );
    if (!blog) return notFoundError(res, "Blog not found");
    return successResponse(res, blog, "Blog retrieved successfully");
  } catch (error) {
    return internalServerError(res, "Error retrieving blog");
  }
};

// Update a blog post by ID
const updateBlog = async (req, res) => {
  try {
    let image;
    if (req.files && req.files.image && req.files.image[0]) {
      const uploadedFile = await cloudinary.uploader.upload(
        req.files.image[0].path,
        {
          folder: "GetHire",
        }
      );

      if (uploadedFile) {
        image = uploadedFile.secure_url;
        req.body.image = image;
      }
    }
    const blog = await BlogModel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!blog) return notFoundError(res, "Blog not found");
    return successResponse(res, blog, "Blog updated successfully");
  } catch (error) {
    return validationError(res, "Error updating blog");
  }
};

// Delete a blog post by ID
const deleteBlog = async (req, res) => {
  try {
    const blog = await BlogModel.findByIdAndDelete(req.params.id);
    if (!blog) return notFoundError(res, "Blog not found");
    return successResponse(res, blog, "Blog deleted successfully");
  } catch (error) {
    return internalServerError(res, "Error deleting blog");
  }
};

const toggleLike = async (req, res) => {
  const { blogId, studentId } = req.params;

  try {
    const blog = await BlogModel.findById(blogId);

    if (!blog) return notFoundError(res, "Blog not found");

    const index = blog.likes.indexOf(studentId);

    if (index > -1) {
      // If the student ID exists, remove it (unlike)
      blog.likes.splice(index, 1);
    } else {
      // If the student ID doesn't exist, add it (like)
      blog.likes.push(studentId);
    }

    await blog.save();

    return successResponse(res, blog, "Like status updated successfully");
  } catch (error) {
    return internalServerError(res, "Error toggling like status");
  }
};

const addComment = async (req, res) => {
  const { blogId, studentId } = req.params;
  const { comment } = req.body;

  try {
    const blog = await BlogModel.findById(blogId);

    if (!blog) return notFoundError(res, "Blog not found");

    const newComment = {
      comment,
      user: studentId,
    };

    blog.comments.push(newComment);

    await blog.save();

    return successResponse(res, blog, "Comment added successfully");
  } catch (error) {
    return internalServerError(res, "Error adding comment");
  }
};

const deleteComment = async (req, res) => {
  const { blogId, commentId } = req.params;

  try {
    const blog = await BlogModel.findById(blogId);

    if (!blog) return notFoundError(res, "Blog not found");

    // Find the index of the comment to delete
    const commentIndex = blog.comments.findIndex(
      (comment) => comment._id.toString() === commentId
    );

    if (commentIndex === -1) return notFoundError(res, "Comment not found");

    // Remove the comment from the comments array
    blog.comments.splice(commentIndex, 1);

    await blog.save();

    return successResponse(res, blog, "Comment deleted successfully");
  } catch (error) {
    return internalServerError(res, "Error deleting comment");
  }
};

module.exports = {
  createBlog,
  getBlog,
  getBlogs,
  updateBlog,
  deleteBlog,
  toggleLike,
  addComment,
  deleteComment,
};
