import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { useChatContext } from "stream-chat-react";
import { toast } from "react-hot-toast";
import {
  AlertCircleIcon,
  HashIcon,
  LockIcon,
  UsersIcon,
  XIcon,
} from "lucide-react";

const CreateChannelModal = ({ onClose }) => {
  const [channelName, setChannelName] = useState("");
  const [channelType, setChannelType] = useState("public");
  const [description, setDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");
  const [users, setUsers] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const [, setSearchParams] = useSearchParams();
  const { client, setActiveChannel } = useChatContext();

  /* --------------------------------------------------
     Fetch users
     -------------------------------------------------- */
  useEffect(() => {
    const fetchUsers = async () => {
      if (!client?.user) return;
      setLoadingUsers(true);

      try {
        const response = await client.queryUsers(
          { id: { $ne: client.user.id } },
          { name: 1 },
          { limit: 100 }
        );

        const usersOnly = response.users.filter(
          (user) => !user.id.startsWith("recording-")
        );

        setUsers(usersOnly);
      } catch (err) {
        console.error("Error fetching users", err);
        setUsers([]);
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsers();
  }, [client]);

  /* --------------------------------------------------
     Auto-select members for public channel
     -------------------------------------------------- */
  useEffect(() => {
    if (channelType === "public") {
      setSelectedMembers(users.map((u) => u.id));
    } else {
      setSelectedMembers([]);
    }
  }, [channelType, users]);

  /* --------------------------------------------------
     Validation
     -------------------------------------------------- */
  const validateChannelName = (name) => {
    if (!name.trim()) return "Channel name cannot be empty.";
    if (name.length < 3)
      return "Channel name must be at least 3 characters long.";
    if (name.length > 22)
      return "Channel name cannot exceed 22 characters.";
    return "";
  };

  const handleChannelNameChange = (e) => {
    const value = e.target.value;
    setChannelName(value);
    setError(validateChannelName(value));
  };

  /* --------------------------------------------------
     FIXED member toggle
     -------------------------------------------------- */
  const handleMemberToggle = (id) => {
    setSelectedMembers((prev) =>
      prev.includes(id)
        ? prev.filter((uid) => uid !== id)
        : [...prev, id]
    );
  };

  /* --------------------------------------------------
     Create or open channel (SAFE)
     -------------------------------------------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validateChannelName(channelName);
    if (validationError) return setError(validationError);
    if (isCreating || !client?.user) return;

    setIsCreating(true);
    setError("");

    try {
      const channelId = `${channelName
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-_]/g, "")
        .slice(0, 16)}-${Date.now().toString().slice(-6)}`;


      const channelData = {
        name: channelName.trim(),
        created_by_id: client.user.id,
        members: [client.user.id, ...selectedMembers],
      };

      if (description) channelData.description = description;

      if (channelType === "private") {
        channelData.private = true;
        channelData.visibility = "private";
      } else {
        channelData.visibility = "public";
        channelData.discoverable = true;
      }

      let channel;

      // 🔑 FIRST: check if channel already exists
      const existing = await client.queryChannels(
        { type: "messaging", id: channelId },
        {},
        { watch: false }
      );

      if (existing.length > 0) {
        channel = existing[0];
      } else {
        channel = client.channel("messaging", channelId, channelData);
        await channel.create(); // ✅ create ONLY once
      }

      await channel.watch();

      setActiveChannel(channel);
      setSearchParams({ channel: channelId });
      toast.success(`Channel "${channelName}" opened`);
      onClose();
    } catch (err) {
      console.error("Error creating channel", err);
      toast.error("Unable to create channel");
    } finally {
      setIsCreating(false);
    }
  };

  /* --------------------------------------------------
     UI
     -------------------------------------------------- */
  return (
    <div className="create-channel-modal-overlay">
      <div className="create-channel-modal">
        <div className="create-channel-modal__header">
          <h2>Create a channel</h2>
          <button onClick={onClose} className="create-channel-modal__close">
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="create-channel-modal__form">
          {error && (
            <div className="form-error">
              <AlertCircleIcon className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          {/* Channel name */}
          <div className="form-group">
            <div className="input-with-icon">
              <HashIcon className="w-4 h-4 input-icon" />
              <input
                type="text"
                value={channelName}
                onChange={handleChannelNameChange}
                placeholder="e.g. marketing"
                autoFocus
                maxLength={22}
                className={`form-input ${error ? "form-input--error" : ""
                  }`}
              />
            </div>
          </div>

          {/* Channel type */}
          <div className="form-group">
            <label>Channel type</label>

            <div className="radio-group">
              <label className="radio-option">
                <input
                  type="radio"
                  value="public"
                  checked={channelType === "public"}
                  onChange={(e) => setChannelType(e.target.value)}
                />
                <HashIcon className="size-4" /> Public
              </label>

              <label className="radio-option">
                <input
                  type="radio"
                  value="private"
                  checked={channelType === "private"}
                  onChange={(e) => setChannelType(e.target.value)}
                />
                <LockIcon className="size-4" /> Private
              </label>
            </div>
          </div>

          {/* Private members */}
          {channelType === "private" && (
            <div className="form-group">
              <label>Add members</label>

              <div className="members-list">
                {loadingUsers ? (
                  <p>Loading users...</p>
                ) : users.length === 0 ? (
                  <p>No users found</p>
                ) : (
                  users.map((user) => (
                    <label key={user.id} className="member-item">
                      <input
                        type="checkbox"
                        checked={selectedMembers.includes(user.id)}
                        onChange={() => handleMemberToggle(user.id)}
                      />
                      <span>{user.name || user.id}</span>
                    </label>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="create-channel-modal__actions">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!channelName.trim() || isCreating}
              className="btn btn-primary"
            >
              {isCreating ? "Creating..." : "Create Channel"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateChannelModal;
