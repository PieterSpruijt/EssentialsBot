const Discord = require('discord.js');
const model = require('../../models/economy');
const model2 = require('../../models/afk');
const model3 = require('../../models/ReactionRole');
const model4 = require('../../models/custom');
const model6 = require('../../models/logchannel');
const model8 = require('../../models/lvlreward');
const model9 = require('../../models/xpdb');
const model10 = require('../../models/settings');
const model11 = require('../../models/warns');
const userdb = require('../../models/userdb');
const logchannel = model6;
const isHexcolor = require('is-hexcolor')

module.exports = {
  name: "settings",
  description: "Change bot settings!",
  category: "config",
  commandOptions: [
    {
      "name": "delguilddata",
      "description": "Delete all saved data of the guild!",
      "type": 1,

    },
    {
      "name": "logchannel",
      "description": "Set the logchannel of the guild!",
      "type": 1,
      options: [
        {
          type: 7,
          name: "channel",
          description: "Channel to set the logchannel to!",
          required: false
        },
      ],

    },
    {
      "name": "snipe",
      "description": "Enable/disable your messages for the snipe command!",
      "type": 1,
      options: [
        {
        type: 5,
        name: `value`,
        description: `The valueto set to!`,
        required: true
        }
      ]

    },
    {
      "name": "color",
      "description": "Set your own embed color!",
      "type": 1,
      options: [
        {
        type: 3,
        name: `hex`,
        description: `Hex value of the color!`,
        required: true
        }
      ]

    },
  ],
  run: async (bot, interaction, userinfo) => {

    let command = interaction.options._subcommand;
    if (command === `logchannel`) {
      if (!interaction.member.permissions.has(bot.perms.ADMINISTRATOR)) return bot.error(`You Dont have Permission to do that! You must be Administrator!`, bot, interaction);
      var storedSettings = await logchannel.findOne({ gid: interaction.guild.id });
      if (!storedSettings) {
        const newSettings = new logchannel({
          gid: interaction.guild.id,
          logchannel: `None`,
          levels: true,
          economy: false,
        });
        await newSettings.save().catch(() => { });
        storedSettings = await logchannel.findOne({ gid: interaction.guild.id });
      }
      if (!interaction.data.options[0]) return await interaction.editReply({ content: `The logchannel for ${interaction.guild.name} is ${storedSettings.logchannel != `None` ? `<#` + storedSettings.logchannel + `>` : `None`}`, ephemeral: true });
      const Channel = interaction.data.options[0].channel;
      

      logchannel.findOne(
        { gid: interaction.guild.id },
        async (err, data) => {
          if (err) throw err;
          data.gid = interaction.guild.id,
            data.logchannel = Channel.id
          data.save();
        }
      );
      interaction.editReply({ content: `${bot.config.emojis.normal.check} | Set the logchannel to <#${Channel.id}>!`, ephemeral: true });
    } else if (command === `delguilddata`) {
      if (!interaction.member.permissions.has(bot.perms.ADMINISTRATOR)) return bot.error(`You Dont have Permission to do that! You must be Administrator!`, bot, interaction);
      let row = new Discord.MessageActionRow()
        .addComponents(
          new Discord.MessageButton()
            .setCustomId(`delguilddata_${interaction.guild.id}`)
            .setLabel(`Yes`)
            .setStyle('PRIMARY'),
          new Discord.MessageButton()
            .setCustomId(`canceldelguilddata_${interaction.guild.id}`)
            .setLabel(`Cancel`)
            .setStyle('PRIMARY')
        );
      let m = await interaction.editReply({
        content: `Click on the Yes button to delete all guilddata, click on the Cancel button to cancel the process!`,
        components: [row]
      });
      const collector = await m.createMessageComponentCollector({ componentType: 'BUTTON', time: 15000 });

      collector.on('collect', async (i) => {
        if (i.user.id === interaction.user.id) {
          await i.deferReply({ ephemeral: true });
          if (i.customId === `delguilddata_${interaction.guild.id}`) {

            var d1 = await model.deleteMany({ gid: interaction.guild.id });
            var d2 = await model2.deleteMany({ gid: interaction.guild.id });
            var d3 = await model3.deleteMany({ Guild: interaction.guild.id });
            var d4 = await model4.deleteMany({ Guild: interaction.guild.id });
            var d6 = await model6.deleteMany({ gid: interaction.guild.id });
            var d8 = await model8.deleteMany({ gid: interaction.guild.id });
            var pattern = `${interaction.guild.id}`
            var d9 = await model9.deleteMany({ id: { $regex: pattern, $options: `x` } });
            var d10 = await model10.deleteMany({ gid: interaction.guild.id });
            var d11 = await model11.deleteMany({ Guild: interaction.guild.id });
            await i.editReply({ content: `Deleted all guild data!`, ephemeral: true });

          } else if (i.customId === `canceldelguilddata_${interaction.guild.id}`) {

            await i.editReply({ content: `Cancelled!`, ephemeral: true });

          }
        } else {
        }
      });

      collector.on('end', async (collected) => {
        if (collected.size === 0) {
          await interaction.followUp({ content: `Cancelled!`, ephemeral: true });
        }
      });
    } else if (command === `snipe`) {
      let value = interaction.data.options[0].value
      let target = interaction.member.user;
    let userinfo2 = await userdb.findOne({ userid: target.id });
    if (!userinfo2) {
      // If there are no settings stored for this guild, we create them and try to retrive them again.
      newSettings = new userdb({
        userid: target.id,
        developer: false,
        banned: false,
        color: `#e91e63`,
        snipe: true,
      });
      await newSettings.save().catch(()=>{});
      userinfo2 = await userdb.findOne({ userid: target.id });
      return await interaction.editReply({embeds: [{description: `I succesfully saved the new user, try your command again`, color: `GREEN`}], ephemeral: true});
    }
      if (value === true) {
        userdb.findOne(
          { userid: target.id },
          async (err, data) => {
            if (err) throw err;
              data[value] = true;
              data.save();
          }
        );
        await interaction.editReply({embeds: [{description: `${bot.config.emojis.normal.check} You turned **Snipe** on`, color: `#e91e63`}], ephemeral: true});
      } else if (value === false) {
        userdb.findOne(
          { userid: target.id },
          async (err, data) => {
            if (err) throw err;
              data[value] = false;
              data.save();
          }
        );
        await interaction.editReply({embeds: [{description: `${bot.config.emojis.normal.check} You turned **Snipe** off`, color: `#e91e63`}], ephemeral: true});
      }

    } else if (command === `color`) {
      if (!isHexcolor(interaction.data.options[0].value)) return await interaction.editReply({embeds: [{description: `${bot.config.emojis.normal.cross} You did not specify an hex color!`, color: `#e91e63`}], ephemeral: true});
        userdb.findOne(
          { userid: interaction.member.user.id },
          async (err, data) => {
            if (err) throw err;
              data.color = interaction.data.options[0].value;
              data.save();
          }
        );
        await interaction.editReply({embeds: [{description: `${bot.config.emojis.normal.check} Changed ${interaction.data.options[0].value} to your default embed color`, color: `#e91e63`}], ephemeral: true});  

    }

  },
};

