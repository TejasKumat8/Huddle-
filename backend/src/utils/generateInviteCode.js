const { customAlphabet } = require("nanoid");

// Avoid ambiguous chars (0/O, 1/I/l) so codes are easy to type/read out loud
const nanoid = customAlphabet("23456789ABCDEFGHJKLMNPQRSTUVWXYZ", 6);

const generateInviteCode = () => nanoid();

module.exports = generateInviteCode;
