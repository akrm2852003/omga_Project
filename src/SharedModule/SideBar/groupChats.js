export function groupChats(chats) {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);

  const groups = { "النهاردة": [], "إمبارح": [], "الأقدم": [] };

  chats.forEach((chat) => {
    const t = new Date(chat.updated_at);
    if (t >= startOfToday) groups["النهاردة"].push(chat);
    else if (t >= startOfYesterday) groups["إمبارح"].push(chat);
    else groups["الأقدم"].push(chat);
  });

  return Object.entries(groups).filter(([, items]) => items.length > 0);
}
