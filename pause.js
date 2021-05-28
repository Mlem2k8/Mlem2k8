module.exports = {
  name: "pause",
  run: async (client, message, args) => {
    const serverQueue = client.queue.get(message.guild.id);
    const { channel } = message.member.voice;
    try {
      if (!channel)
        return message.channel.send(
          "Hãy vào Voice Channel để dừng nhạc!"
        );
      if (message.guild.me.voice.channel !== message.member.voice.channel) {
        return message.channel.send(
          "Cần phải chung phòng với bot thì mới pause dc"
        );
      }
      if (serverQueue && serverQueue.playing) {
        serverQueue.playing = false;
        serverQueue.connection.dispatcher.pause(true);
        return message.channel.send({
          embed: {
            color: "BLUE",
            description: "**⏸ PAUSED**"
          }
        });
      }
      return message.channel.send("**Ko có nhạc để dừng!**");
    } catch {
      serverQueue.connection.dispatcher.end();
      await channel.leave();
    }
  }
};
