import React, { useState, useEffect, useRef } from "react";
import { EyeIcon, EyeSlashIcon, EllipsisVerticalIcon } from '@heroicons/react/24/outline';
import { register, login, getPosts, createPost, updatePost, deletePost, createComment, updateComment, deleteComment, getProfile } from './api';


const formatRelativeTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);

  if (diffSeconds < 60) {
    return "just now";
  } else if (diffMinutes < 60) {
    return `${diffMinutes} min${diffMinutes === 1 ? "" : "s"} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  } else {
    return date.toLocaleString();
  }
};

// Header Component
function Header({ currentUser, onLogout }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onDoc = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between px-4 py-3 bg-[#3f68b4] text-white shadow-md sm:px-6 md:px-8">
      <h1 className="text-2xl italic -rotate-2 sm:text-3xl md:text-4xl lg:text-5xl">
        Trendora
      </h1>
      <div className="relative" ref={ref}>
        <button
          className="flex items-center gap-2 text-sm font-semibold sm:text-base"
          onClick={() => setOpen(!open)}
        >
          <span className="hidden sm:inline">
            Signed in {currentUser?.username || "jas"}
          </span>
          <span className="sm:hidden w-8 h-8 flex items-center justify-center rounded-full bg-white text-[#3f68b4] font-bold">
            {currentUser?.username?.[0]?.toUpperCase() || "J"}
          </span>
        </button>
        {open && (
          <div className="absolute right-0 top-full mt-1 w-32 bg-white text-black rounded-lg shadow-lg z-20">
            <button
              className="w-full px-3 py-2 text-center font-semibold hover:bg-gray-200 transition-colors"
              onClick={onLogout}
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

function UserModal({ username, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="w-full max-w-xs rounded-lg bg-white p-6 shadow-xl sm:max-w-sm relative">
        <button
          onClick={onClose}
          className="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h3 className="mb-4 text-lg font-semibold sm:text-xl">User Info</h3>
        <p className="text-sm sm:text-base">Username: <strong>{username}</strong></p>
      </div>
    </div>
  );
}

function Comment({ comment, onEditComment, onDeleteComment, currentUser, postId }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false); 
  const menuRef = useRef(null);

  useEffect(() => {
    const onDoc = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setIsMenuOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <div className="relative rounded-lg bg-gray-50 p-3">
      {currentUser?.username === comment.author.username && (
        <div className="absolute right-2 top-2" ref={menuRef}>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-gray-500 hover:text-gray-700"
          >
            <EllipsisVerticalIcon className="h-4 w-4" />
          </button>
          {isMenuOpen && (
            <div className="absolute right-0 top-full mt-1 w-32 bg-white text-black rounded-lg shadow-lg z-20">
              <button
                className="w-full px-3 py-2 text-left text-sm font-semibold hover:bg-gray-200 transition-colors"
                onClick={() => {
                  setIsEditing(true);
                  setIsMenuOpen(false);
                }}
              >
                Edit
              </button>
              <button
                className="w-full px-3 py-2 text-left text-sm font-semibold text-red-600 hover:bg-gray-200 transition-colors"
                onClick={() => {
                  setIsConfirmDeleteOpen(true); 
                  setIsMenuOpen(false);
                }}
              >
                Delete
              </button>
            </div>
          )}
        </div>
      )}
      {isEditing ? (
        <CommentForm
          onEdit={(commentId, body) => onEditComment(postId, commentId, body)}
          commentId={comment.id}
          initialText={comment.body}
          onCancel={() => setIsEditing(false)}
          authorName={currentUser?.username}
        />
      ) : (
        <>
          <div className="text-xs text-gray-800 sm:text-sm">
            <strong>{comment.author.username}</strong> •{" "}
            <span className="text-gray-500">
              {formatRelativeTime(comment.createdAt)}
            </span>
          </div>
          <div className="mt-1 text-sm sm:text-base">{comment.body}</div>
        </>
      )}
      {isConfirmDeleteOpen && (
        <ConfirmationModal
          message="Are you sure you want to delete this comment?"
          onConfirm={() => {
            onDeleteComment(comment.id);
            setIsConfirmDeleteOpen(false);
          }}
          onCancel={() => setIsConfirmDeleteOpen(false)}
        />
      )}
    </div>
  );
}

function SuccessModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 bg-opacity-50 p-4">
      <div className="w-full max-w-xs rounded-lg bg-white p-6 shadow-xl sm:max-w-sm">
        <h3 className="mb-4 text-lg font-semibold sm:text-xl">Account Created!</h3>
        <p className="mb-6 text-sm sm:text-base">
          Your account has been successfully created. You will now proceed to the login page.
        </p>
        <button
          onClick={onClose}
          className="w-full rounded-lg bg-[#2b2f52] py-2 text-sm font-semibold text-white sm:text-base"
        >
          OK
        </button>
      </div>
    </div>
  );
}

  function ConfirmationModal({ onConfirm, onCancel, message }) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 bg-opacity-50 p-4">
        <div className="w-full max-w-xs rounded-lg bg-white p-6 shadow-xl sm:max-w-sm">
          <h3 className="mb-4 text-lg font-semibold sm:text-xl">Confirm Deletion</h3>
          <p className="mb-6 text-sm sm:text-base">{message}</p>
          <div className="flex gap-2">
            <button
              onClick={onConfirm}
              className="flex-1 rounded-lg bg-red-600 py-2 text-sm font-semibold text-white hover:bg-red-700 sm:text-base"
            >
              Confirm
            </button>
            <button
              onClick={onCancel}
              className="flex-1 rounded-lg bg-gray-300 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-400 sm:text-base"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

function PostModal({ post, onAddComment, onEditPost, onDeletePost, onDeleteComment, currentUser, usersById, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm bg-opacity-50 p-4">
      <div className="w-full max-w-4xl rounded-2xl bg-white shadow-xl relative flex flex-col max-h-[90vh] overflow-hidden">
        <div className="sticky top-0 z-10 bg-white px-6 py-6 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Post</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-6 pb-6">
          <Post
            post={post}
            onAddComment={onAddComment}
            onEditPost={onEditPost}
            onDeletePost={onDeletePost}
            onEditComment={onEditComment}
            onDeleteComment={onDeleteComment}
            currentUser={currentUser}
            usersById={usersById}
          />
        </div>
      </div>
    </div>
  );
}

function Auth({ onLogin, onRegister, error }) {
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginName, setLoginName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [msg, setMsg] = useState({ username: "", password: "", confirm: "", global: error || "" });
  const [formError, setFormError] = useState("");
  const [showModal, setShowModal] = useState(false);

  const usernameRegex = /^[a-zA-Z][a-zA-Z0-9_-]*$/;
  const passwordRegexes = {
    length: /.{8,}/,
    lowercase: /[a-z]/,
    uppercase: /[A-Z]/,
    specialChar: /[!@#$%^&*(),.?":{}|<>]/,
  };

  const [passwordValidations, setPasswordValidations] = useState({
    length: false,
    lowercase: false,
    uppercase: false,
    specialChar: false,
  });

  useEffect(() => {
    if (isRegister && username) {
      if (!usernameRegex.test(username)) {
        setMsg((prev) => ({
          ...prev,
          username: "Username must start with a letter and contain only letters, numbers, underscores, or hyphens.",
        }));
      } else {
        setMsg((prev) => ({ ...prev, username: "" }));
      }
    } else if (isRegister && !username) {
      setMsg((prev) => ({ ...prev, username: "" }));
    }
  }, [username, isRegister]);

  useEffect(() => {
    if (isRegister && password) {
      setPasswordValidations({
        length: passwordRegexes.length.test(password),
        lowercase: passwordRegexes.lowercase.test(password),
        uppercase: passwordRegexes.uppercase.test(password),
        specialChar: passwordRegexes.specialChar.test(password),
      });
    } else {
      setPasswordValidations({
        length: false,
        lowercase: false,
        uppercase: false,
        specialChar: false,
      });
    }
  }, [password, isRegister]);

  useEffect(() => {
    if (isRegister && confirmPw && password) {
      setMsg((prev) => ({
        ...prev,
        confirm: confirmPw === password ? "" : "Passwords do not match.",
      }));
    } else if (isRegister && confirmPw) {
      setMsg((prev) => ({ ...prev, confirm: "Please enter password first." }));
    } else {
      setMsg((prev) => ({ ...prev, confirm: "" }));
    }
  }, [confirmPw, password, isRegister]);

  function validateForm() {
    const newMsg = { username: "", password: "", confirm: "", global: "" };
    let isValid = true;

    if (isRegister) {
      if (!username.trim()) {
        newMsg.username = "Please enter a username.";
        isValid = false;
      } else if (!usernameRegex.test(username)) {
        newMsg.username = "Username must start with a letter and contain only letters, numbers, underscores, or hyphens.";
        isValid = false;
      }

      if (!password.trim()) {
        newMsg.password = "Please enter a password.";
        isValid = false;
      } else if (
        !passwordValidations.length ||
        !passwordValidations.lowercase ||
        !passwordValidations.uppercase ||
        !passwordValidations.specialChar
      ) {
        newMsg.password = "Password does not meet all requirements.";
        isValid = false;
      }

      if (!confirmPw.trim()) {
        newMsg.confirm = "Please confirm your password.";
        isValid = false;
      } else if (confirmPw !== password) {
        newMsg.confirm = "Passwords do not match.";
        isValid = false;
      }
    } else {
      if (!loginName.trim()) {
        newMsg.username = "Please enter your username.";
        isValid = false;
      }
      if (!password.trim()) {
        newMsg.password = "Please enter your password.";
        isValid = false;
      }
    }

    if (!isValid && isRegister) {
      setFormError("Please fill in all fields correctly.");
    } else {
      setFormError("");
    }

    setMsg(newMsg);
    return isValid;
  }

  async function submit(e) {
    e.preventDefault();
    if (!validateForm()) return;

    setFormError("");
    setPassword("");
    setConfirmPw("");

    try {
      if (isRegister) {
        await onRegister(username.trim(), password);
        setMsg({ username: "", password: "", confirm: "", global: "" });
        setShowModal(true);
      } else {
        await onLogin(loginName.trim(), password);
        setMsg({ username: "", password: "", confirm: "", global: "" });
        setLoginName("");
      }
    } catch (error) {
      setMsg((prev) => ({ ...prev, global: error.message }));
    }
  }

  const errorClass = (field) =>
    msg[field] ? "border border-crimson bg-red-50" : "";

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4 sm:p-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl sm:p-8">
        <h2 className="mb-6 text-center text-xl font-semibold sm:text-2xl">
          {isRegister ? "Create an account" : "Login to Trendora"}
        </h2>

        {msg.global && (
          <div className="mb-4 rounded bg-red-600 p-2 text-center text-xs text-white sm:text-sm">
            {msg.global}
          </div>
        )}

        <form onSubmit={submit} className="flex flex-col gap-4">
          <div>
            <input
              type="text"
              placeholder="Username"
              className={`w-full rounded-lg border px-3 py-2 text-sm ${errorClass("username")}`}
              value={isRegister ? username : loginName}
              onChange={(e) =>
                isRegister ? setUsername(e.target.value) : setLoginName(e.target.value)
              }
            />
            {msg.username && (
              <div className="mt-1 text-xs text-red-600 sm:text-sm">{msg.username}</div>
            )}
          </div>

          <div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className={`w-full rounded-lg border px-3 py-2 pr-10 text-sm ${errorClass("password")}`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>
            {msg.password && (
              <div className="mt-1 text-xs text-red-600 sm:text-sm">{msg.password}</div>
            )}
            {isRegister && password && (
              <div className="mt-2 space-y-1 text-xs sm:text-sm">
                <div
                  className={`flex items-center gap-1 ${
                    passwordValidations.length ? "text-green-600" : "text-gray-600"
                  }`}
                >
                  {passwordValidations.length ? "✓" : "✗"} Must be at least 8 characters
                </div>
                <div
                  className={`flex items-center gap-1 ${
                    passwordValidations.lowercase ? "text-green-600" : "text-gray-600"
                  }`}
                >
                  {passwordValidations.lowercase ? "✓" : "✗"} Must have at least one lowercase letter
                </div>
                <div
                  className={`flex items-center gap-1 ${
                    passwordValidations.uppercase ? "text-green-600" : "text-gray-600"
                  }`}
                >
                  {passwordValidations.uppercase ? "✓" : "✗"} Must have at least one uppercase letter
                </div>
                <div
                  className={`flex items-center gap-1 ${
                    passwordValidations.specialChar ? "text-green-600" : "text-gray-600"
                  }`}
                >
                  {passwordValidations.specialChar ? "✓" : "✗"} Must have at least one special character
                </div>
              </div>
            )}
          </div>

          {isRegister && (
            <div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Confirm Password"
                  className={`w-full rounded-lg border px-3 py-2 pr-10 text-sm ${errorClass("confirm")}`}
                  value={confirmPw}
                  onChange={(e) => setConfirmPw(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
              {msg.confirm && (
                <div className="mt-1 text-xs text-red-600 sm:text-sm">{msg.confirm}</div>
              )}
            </div>
          )}

          {formError && isRegister && (
            <div className="text-center text-xs text-red-600 sm:text-sm">{formError}</div>
          )}

          <button
            type="submit"
            className="rounded-lg bg-[#2b2f52] py-2 text-sm font-semibold text-white sm:text-base"
          >
            {isRegister ? "Sign Up" : "Login"}
          </button>
        </form>

        <div className="mt-4 text-center text-sm sm:text-base">
          {isRegister ? (
            <>
              Already have an account?{" "}
              <button
                onClick={() => {
                  setIsRegister(false);
                  setMsg({ username: "", password: "", confirm: "", global: "" });
                  setFormError("");
                  setPassword("");
                  setConfirmPw("");
                  setUsername("");
                }}
                className="font-semibold text-[#3f68b4]"
              >
                Login here
              </button>
            </>
          ) : (
            <>
              No account yet?{" "}
              <button
                onClick={() => {
                  setIsRegister(true);
                  setMsg({ username: "", password: "", confirm: "", global: "" });
                  setFormError("");
                  setPassword("");
                  setLoginName("");
                }}
                className="font-semibold text-[#3f68b4]"
              >
                Register here
              </button>
            </>
          )}
        </div>
      </div>

      {showModal && (
        <SuccessModal
          onClose={() => {
            setShowModal(false);
            setIsRegister(false);
            setUsername("");
            setPassword("");
            setConfirmPw("");
            setMsg({ username: "", password: "", confirm: "", global: "" });
            setFormError("");
          }}
        />
      )}
    </div>
  );
}

function CommentForm({ onAdd, authorName, onEdit, commentId, initialText = "", onCancel }) {
  const [text, setText] = useState(initialText);
  const [error, setError] = useState(null);

  async function submit(e) {
    e.preventDefault();
    if (!text.trim()) {
      setError("Comment cannot be empty.");
      return;
    }
    if (text.length > 250) {
      setError("Comment cannot exceed 250 characters.");
      return;
    }
    try {
      if (commentId && onEdit) {
        await onEdit(commentId, text.trim());
      } else {
        await onAdd({ body: text.trim() });
      }
      setText("");
      setError(null);
      if (onCancel) onCancel();
    } catch (error) {
      setError(error.message);
    }
  }

  return (
    <form onSubmit={submit} className="mt-3">
      <div className="relative">
        <input
          placeholder="Write a comment... (max 250 characters)"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full rounded-lg border px-3 py-2 pr-12 text-sm"
          maxLength={250}
        />
        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-500">
          {text.length}/250
        </span>
      </div>
      {error && <div className="mt-1 text-xs text-red-600 sm:text-sm">{error}</div>}
      <div className="mt-2 flex gap-2">
        <button
          type="submit"
          className="rounded bg-[#2b2f52] px-3 py-1 text-xs text-white sm:text-sm"
        >
          {commentId ? "Save" : "Comment"}
        </button>
        {commentId && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded bg-gray-300 px-3 py-1 text-xs text-gray-800 sm:text-sm"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

function PostEditor({ onCreate, onEdit, postId, initialTitle = "", initialBody = "", onCancel, currentUser }) {
  const [title, setTitle] = useState(initialTitle);
  const [body, setBody] = useState(initialBody);
  const [error, setError] = useState(null);

  async function submit(e) {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      setError("Both title and content are required.");
      return;
    }
    try {
      if (postId && onEdit) {
        await onEdit(postId, { title: title.trim(), body: body.trim() });
      } else {
        await onCreate({ title: title.trim(), body: body.trim() });
      }
      setTitle("");
      setBody("");
      setError(null);
      if (onCancel) onCancel();
    } catch (error) {
      setError(error.message);
    }
  }

  if (!currentUser) return null;

  return (
    <div className="rounded-2xl bg-white p-4 shadow-lg sm:p-6">
      <h3 className="mb-4 text-lg font-semibold sm:text-xl">
        {postId ? "Edit Post" : "Create a post"}
      </h3>
      <form onSubmit={submit} className="flex flex-col gap-3">
        <input
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-lg border px-3 py-2 text-sm"
        />
        <textarea
          placeholder="Write your post..."
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="h-40 w-full rounded-lg border px-3 py-2 text-sm sm:h-48"
        />
        {error && <div className="text-xs text-red-600 sm:text-sm">{error}</div>}
        <div className="mt-2 flex gap-2">
          <button
            type="submit"
            className="rounded bg-[#2b2f52] px-3 py-1 text-xs font-semibold text-white sm:text-sm"
          >
            {postId ? "Save" : "Publish"}
          </button>
          {postId && (
            <button
              type="button"
              onClick={onCancel}
              className="rounded bg-gray-300 px-3 py-1 text-xs font-semibold text-gray-800 sm:text-sm"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

function Post({ post, onAddComment, onEditPost, onDeletePost, onEditComment, onDeleteComment, currentUser, usersById }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false); 
  const [currentPage, setCurrentPage] = useState(1);
  const commentsPerPage = 10;
  const menuRef = useRef(null);

  useEffect(() => {
    const onDoc = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setIsMenuOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const indexOfLastComment = currentPage * commentsPerPage;
  const indexOfFirstComment = indexOfLastComment - commentsPerPage;
  const comments = post.comments || [];
  const currentComments = comments.slice(indexOfFirstComment, indexOfLastComment);
  const totalPages = Math.ceil(comments.length / commentsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <>
      <article
        className="relative rounded-2xl bg-white p-4 shadow-lg sm:p-6"
        style={{ background: post.color || "#fff" }}
      >
        {currentUser?.username === post.author.username && (
          <div className="absolute right-4 top-4 sm:right-6" ref={menuRef}>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-500 hover:text-gray-700"
            >
              <EllipsisVerticalIcon className="h-5 w-5" />
            </button>
            {isMenuOpen && (
              <div className="absolute right-0 top-full mt-1 w-32 bg-white text-black rounded-lg shadow-lg z-20">
                <button
                  className="w-full px-3 py-2 text-left text-sm font-semibold hover:bg-gray-200 transition-colors"
                  onClick={() => {
                    setIsEditing(true);
                    setIsMenuOpen(false);
                  }}
                >
                  Edit
                </button>
                <button
                  className="w-full px-3 py-2 text-left text-sm font-semibold text-red-600 hover:bg-gray-200 transition-colors"
                  onClick={() => {
                    setIsConfirmDeleteOpen(true); 
                    setIsMenuOpen(false);
                  }}
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        )}

        {isEditing ? (
          <PostEditor
            onEdit={onEditPost}
            postId={post.id}
            initialTitle={post.title}
            initialBody={post.body}
            onCancel={() => setIsEditing(false)}
            currentUser={currentUser}
          />
        ) : (
          <>
            <h2 className="mb-1 text-lg font-semibold sm:text-xl">{post.title}</h2>
            <div className="mb-2 text-xs text-gray-600 sm:text-sm">
              by{" "}
              <button
                onClick={() => setIsModalOpen(true)}
                className="font-semibold text-[#3f68b4] hover:underline"
              >
                {post.author.username}
              </button>{" "}
              • {formatRelativeTime(post.createdAt)}
            </div>
            <p className="whitespace-pre-wrap text-sm sm:text-base">{post.body}</p>

            <section className="mt-4">
              <strong className="text-sm sm:text-base">
                Comments ({comments.length})
              </strong>

              <div className="mt-2 space-y-2">
                {comments.length > 0 ? (
                  currentComments.map((c) => (
                    <Comment
                      key={c.id}
                      comment={c}
                      onEditComment={onEditComment}
                      onDeleteComment={onDeleteComment}
                      currentUser={currentUser}
                      postId={post.id}
                    />
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">No comments yet.</p>
                )}
              </div>

              {post.comments.length > commentsPerPage && (
                <div className="mt-4 flex justify-center space-x-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => paginate(page)}
                      className={`px-3 py-1 text-sm rounded ${
                        currentPage === page
                          ? "bg-[#2b2f52] text-white"
                          : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
              )}
              {currentUser && (
                <CommentForm
                  onAdd={({ body }) => onAddComment(post.id, { body })}
                  authorName={currentUser.username}
                />
              )}
            </section>
          </>
        )}
      </article>
      {isModalOpen && (
        <PostModal
          post={post}
          onAddComment={onAddComment}
          onEditPost={onEditPost}
          onDeletePost={onDeletePost}
          onEditComment={onEditComment}
          onDeleteComment={onDeleteComment}
          currentUser={currentUser}
          usersById={usersById}
          onClose={() => setIsModalOpen(false)}
        />
      )}
      {isConfirmDeleteOpen && (
        <ConfirmationModal
          message="Are you sure you want to delete this post?"
          onConfirm={() => {
            onDeletePost(post.id);
            setIsConfirmDeleteOpen(false);
          }}
          onCancel={() => setIsConfirmDeleteOpen(false)}
        />
      )}
    </>
  );
}

function PostsList({ posts, onAddComment, onEditPost, onDeletePost, onEditComment, onDeleteComment, currentUser, usersById }) {
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 10; 

  if (!posts || !Array.isArray(posts) || posts.length === 0) {
    return (
      <div className="rounded-2xl bg-white p-4 text-center sm:p-6">
        No posts yet — be the first!
      </div>
    );
  }

  const validPosts = posts.filter((p) => p && typeof p === 'object' && p.id);

  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = validPosts.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(validPosts.length / postsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="space-y-4">
      {currentPosts
        .slice()
        .reverse()
        .map((p) => (
          <Post
            key={p.id}
            post={p}
            onAddComment={onAddComment}
            onEditPost={onEditPost}
            onDeletePost={onDeletePost}
            onEditComment={onEditComment}
            onDeleteComment={onDeleteComment}
            currentUser={currentUser}
            usersById={usersById}
          />
        ))}
      {validPosts.length > postsPerPage && (
        <div className="mt-4 flex justify-center space-x-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => paginate(page)}
              className={`px-3 py-1 text-sm rounded ${
                currentPage === page
                  ? "bg-[#2b2f52] text-white"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
            >
              {page}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [posts, setPosts] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('Running App useEffect');

    const token = localStorage.getItem('token');
    if (token) {
      getProfile()
        .then((user) => setCurrentUser(user))
        .catch((err) => {
          console.error('Profile fetch failed:', err);
          localStorage.removeItem('token');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }

    async function fetchPosts() {
      try {
        const data = await getPosts();
        const validPosts = Array.isArray(data)
          ? data.filter((p) => p && typeof p === "object" && p.id && p.author)
          : [];
        setPosts(validPosts);
      } catch (err) {
        console.error("Fetch posts error:", err);
        setError("Failed to load posts");
        setPosts([]);
      }
    }

    fetchPosts();
  }, []);

  async function handleRegister(username, password) {
    await register(username, password);
  }

  async function handleLogin(username, password) {
    const { accessToken } = await login(username, password);
    localStorage.setItem('token', accessToken);
    setCurrentUser({ username });
    setError('');
  }

  function handleLogout() {
    localStorage.removeItem('token');
    setCurrentUser(null);
    setError('');
  }

  if (loading) return <div>Loading...</div>;

  async function handleCreatePost({ title, body }) {
    if (!currentUser) {
      setError('Sign in to create posts.');
      return;
    }
    try {
      const newPost = await createPost({ title, body });
      console.log('Backend createPost result:', newPost);
      setPosts((prev) => [newPost, ...prev]);
    } catch (err) {
      setError(err.message);
    }
  }


  async function editPost(postId, { title, body }) {
    try {
      const updatedPost = await updatePost(postId, { title, body });
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? updatedPost : p))
      );
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDeletePost(postId) {
    try {
      await deletePost(postId);
      setPosts(prevPosts => prevPosts.filter(p => p.id !== postId));
    } catch (err) {
      console.error('Delete post failed:', err);
    }
  }



  async function addComment(postId, { body }) {
    try {
      const newComment = await createComment(postId, { body });

      const commentWithAuthor = {
        ...newComment,
        author: currentUser,
      };

      setPosts(prev =>
        prev.map(p =>
          p.id === postId
            ? { ...p, comments: [...(p.comments || []), commentWithAuthor] }
            : p
        )
      );
    } catch (err) {
      setError(err.message);
    }
  }


  async function editComment(postId, commentId, body) {
    try {
      const updatedComment = await updateComment(commentId, { body });
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? {
                ...p,
                comments: p.comments.map((c) =>
                  c.id === commentId ? updatedComment : c
                ),
              }
            : p
        )
      );
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDeleteComment(commentId) {
    try {
      await deleteComment(commentId);
      
      setPosts(prevPosts =>
        prevPosts.map(post => ({
          ...post,
          comments: Array.isArray(post.comments)
            ? post.comments.filter(comment => comment.id !== commentId)
            : [],
        }))
      );

      console.log(`Comment ${commentId} removed locally`);
    } catch (err) {
      console.error('Delete comment failed:', err);
    }
  }




  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-300 font-sans text-gray-900">
        <Auth onLogin={handleLogin} onRegister={handleRegister} error={error} />
      </div>
    );
  }

  const usersById = Object.fromEntries(
    posts
      .filter((p) => p && typeof p === 'object') 
      .flatMap((p) => {
        const entries = [];
        if (p.author && p.authorId) { 
          entries.push([p.authorId, p.author]);
        }
        if (p.comments && Array.isArray(p.comments)) {
          entries.push(
            ...p.comments
              .filter((c) => c && c.author && c.authorId) 
              .map((c) => [c.authorId, c.author])
          );
        }
        return entries;
      })
      .filter(([_, user]) => user) 
  );

  return (
    <div className="min-h-screen bg-gray-300 font-sans text-gray-900 flex flex-col">
      <Header currentUser={currentUser} onLogout={handleLogout} />
      <main className="flex-1 p-4 sm:p-6 md:p-8">
        <div className="mx-auto max-w-4xl lg:max-w-7xl">
          {error && (
            <div className="mb-4 rounded bg-red-600 p-2 text-center text-xs text-white sm:text-sm">
              {error}
            </div>
          )}
          <div className="grid gap-4 sm:gap-6 md:grid-cols-[1fr_1fr] md:gap-8">
            <div className="order-2 md:order-1">
              <PostEditor onCreate={handleCreatePost} currentUser={currentUser} />
            </div>
            <div className="order-1 md:order-2">
              <PostsList
                posts={posts}
                onAddComment={addComment}
                onEditPost={editPost}
                onDeletePost={handleDeletePost}
                onEditComment={editComment}
                onDeleteComment={handleDeleteComment}
                currentUser={currentUser}
                usersById={usersById}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}