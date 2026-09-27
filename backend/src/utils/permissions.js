export const canReply = (ticket, user) => {
  if (user.role === "admin") return true;
  return (ticket.assignedAgents || []).some((id) => id.toString() === user._id.toString());
};