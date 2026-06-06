const {
    Client,
    GatewayIntentBits,
    ChannelType,
    PermissionsBitField,
    EmbedBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    REST,
    Routes,
    SlashCommandBuilder
} = require('discord.js');

const TOKEN = process.env.TOKEN;

const GUILD_ID = '1506197294666485831';

const PAYPAL_CATEGORY = '1512903754108895342';
const GOOGLEPAY_CATEGORY = '1512903796479754351';
const SUPPORT_CATEGORY = '1512903829488930856';

const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

client.once('ready', async () => {
    console.log(`Logged in as ${client.user.tag}`);

    const commands = [
        new SlashCommandBuilder()
            .setName('panel')
            .setDescription('Send the payment panel')
            .toJSON()
    ];

    const rest = new REST({ version: '10' }).setToken(TOKEN);

    try {
        await rest.put(
            Routes.applicationGuildCommands(
                client.user.id,
                GUILD_ID
            ),
            { body: commands }
        );

        console.log('Slash command registered.');
    } catch (err) {
        console.error(err);
    }
});

client.on('interactionCreate', async interaction => {

    if (interaction.isChatInputCommand()) {

        if (interaction.commandName === 'panel') {

            const embed = new EmbedBuilder()
                .setTitle('Ecco - Tickets')
                .setDescription(`
**Prices**
• Script: $30 / R$4500

**Accepted Payment Methods**
• PayPal
• Google Pay

**Support**
• Need help? Open a support ticket below.
                `);

            const menu = new StringSelectMenuBuilder()
                .setCustomId('payment_select')
                .setPlaceholder('Select your payment method')
                .addOptions(
                    {
                        label: 'PayPal',
                        value: 'paypal',
                        emoji: '💳'
                    },
                    {
                        label: 'Google Pay',
                        value: 'googlepay',
                        emoji: '📱'
                    },
                    {
                        label: 'Support',
                        value: 'support',
                        emoji: '🛠️'
                    }
                );

            const row = new ActionRowBuilder()
                .addComponents(menu);

            await interaction.reply({
                embeds: [embed],
                components: [row]
            });
        }
    }

    if (interaction.isStringSelectMenu()) {

        let category;
        let ticketType;

        switch (interaction.values[0]) {

            case 'paypal':
                category = PAYPAL_CATEGORY;
                ticketType = 'paypal';
                break;

            case 'googlepay':
                category = GOOGLEPAY_CATEGORY;
                ticketType = 'googlepay';
                break;

            case 'support':
                category = SUPPORT_CATEGORY;
                ticketType = 'support';
                break;

            default:
                return;
        }

        const guild = interaction.guild;

        const channel = await guild.channels.create({
            name: `${ticketType}-${interaction.user.username}`,
            type: ChannelType.GuildText,
            parent: category,
            permissionOverwrites: [
                {
                    id: guild.roles.everyone.id,
                    deny: [
                        PermissionsBitField.Flags.ViewChannel
                    ]
                },
                {
                    id: interaction.user.id,
                    allow: [
                        PermissionsBitField.Flags.ViewChannel,
                        PermissionsBitField.Flags.SendMessages,
                        PermissionsBitField.Flags.ReadMessageHistory
                    ]
                }
            ]
        });

        await channel.send({
            embeds: [
                new EmbedBuilder()
                    .setTitle('Ticket Created')
                    .setDescription(
                        `Welcome ${interaction.user}!\n\nA staff member will assist you shortly.`
                    )
            ]
        });

        await interaction.reply({
            content: `Your ticket has been created: ${channel}`,
            ephemeral: true
        });
    }
});

client.login(TOKEN);
