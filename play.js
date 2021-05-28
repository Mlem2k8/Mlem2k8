const { Util, MessageEmbed } = require("discord.js");
const ytdl = require("ytdl-core");
const yts = require("yt-search");

module.exports = {
  name: "play",
  description: "To play songs :D",
  usage: "<song_name>",
  aliases: ["p"],
  
  run: async function(client, message, args) {
    const channel = message.member.voice.channel;
    if (!channel) {
      message.channel.send("Địt mẹ m vào trong voice chat trc khi sử dụng lệnh ok");
    }
if (message.guild.me.voice.channel && message.member.voice.channel.id !== message.guild.me.voice.channel.id) return message.channel.send(`${client.emotes.error} - You are not in the same voice channel !`);
    
if (!message.guild.me.hasPermission("CONNECT")) {
      message.channel.send({
        embed: {
          color: "dfdb3b",
          description:
            ":> Tôi ko đủ quyền để kết nối voice!"
        }
      });
    }
    if (!message.guild.me.hasPermission("SPEAK")) {
      message.channel.send({
        embed: {
          color: "dfdb3b",
          description:
            ">:( Tôi không đủ quyền để phát nhạc!"
        }
      });
    }
    var searchString = args.join(" ");
    if (!searchString) {
      message.channel.send(":P Bạn có thể dùng tên nhạc hoặc link");
    }

    var serverQueue = message.client.queue.get(message.guild.id);

    var searched = await yts.search(searchString);
    if (searched.videos.length === 0) {
      message.channel.send("Ko tìm thấy nhạc này");
    }
    var songInfo = searched.videos[0];

    const song = {
      id: songInfo.videoId,
      title: Util.escapeMarkdown(songInfo.title),
      views: String(songInfo.views).padStart(10, " "),
      url: songInfo.url,
      ago: songInfo.ago,
      duration: songInfo.duration.toString(),
      img: songInfo.image,
      req: message.author
    };

    if (serverQueue) {
      serverQueue.songs.push(song);
      let thing = new MessageEmbed()
        .setTitle("Bài hát này đã đc add vào list queue")
        .setImage(song.img)
        .setColor("PURPLE")
        .setDescription(
          `**Tên nhạc**   
[${song.title}](${song.url})     

**Thời gian**
${song.duration}

**Sử dụng bởi**
[${message.author}]


        
        
        `
        )
        .setFooter(`Nani Music!!!`);
      return message.channel.send(thing);
    }

    const queueConstruct = {
      textChannel: message.channel,
      voiceChannel: channel,
      connection: null,
      songs: [],
      volume: 3.5,
      playing: true
    };
    message.client.queue.set(message.guild.id, queueConstruct);
    queueConstruct.songs.push(song);

    const play = async song => {
      const queue = message.client.queue.get(message.guild.id);
      if (!song) {
         message.client.queue.delete(message.guild.id);
        return;
      }

      const dispatcher = queue.connection
        .play(ytdl(song.url))
        .on("finish", () => {
          queue.songs.shift();
          play(queue.songs[0]);
        })
        .on("error", error => console.error(error));
      dispatcher.setVolumeLogarithmic(queue.volume / 5);
      let thing = new MessageEmbed()
        .setTitle("NGHE NHẠC")
        .setDescription(
          `
**Tên nhạc**   
[${song.title}](${song.url})     

**Thời gian**
${song.duration}

**Sử dụng bởi**
[${message.author}]
`
        )

        .setImage(song.img)
        .setColor("YELLOW")
        .setFooter(`Nani Music!!! | ADD ME IN YOUR SERVER`);
      queue.textChannel.send(thing);
    };

    try {
      const connection = await channel.join();
      queueConstruct.connection = connection;
      channel.guild.voice.setSelfDeaf(true);
      play(queueConstruct.songs[0]);
    } catch (error) {
      console.error(`I could not join the voice channel: ${error}`);
      message.client.queue.delete(message.guild.id);
      //await channel.leave();
      return console.log(
        `I could not join the voice channel: ${error}`,
        message.channel
      );
    }
  }
};
