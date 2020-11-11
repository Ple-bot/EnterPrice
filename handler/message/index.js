require('dotenv').config()
const { decryptMedia, Client } = require('@open-wa/wa-automate')
const moment = require('moment-timezone')
moment.tz.setDefault('Asia/Jakarta').locale('id')
const { downloader, cekResi, removebg, urlShortener, meme, translate, getLocationData } = require('../../lib')
const { msgFilter, color, processTime, is } = require('../../utils')
const mentionList = require('../../utils/mention')
const { uploadImages } = require('../../utils/fetcher')

const { menuId, menuEn } = require('./text') // Indonesian & English menu

module.exports = msgHandler = async (client, message) => {
    try {
        const { type, id, from, t, sender, isGroupMsg, chat, caption, isMedia, isGif, mimetype, quotedMsg, quotedMsgObj, mentionedJidList } = message
        let { body } = message
        const { name, formattedTitle } = chat
        let { pushname, verifiedName, formattedName } = sender
        pushname = pushname || verifiedName || formattedName // verifiedName is the name of someone who uses a business account
        const botNumber = await client.getHostNumber() + '@c.us'
        const groupId = isGroupMsg ? chat.groupMetadata.id : ''
        const groupAdmins = isGroupMsg ? await client.getGroupAdmins(groupId) : ''
        const groupMembers = isGroupMsg ? await client.getGroupMembersId(groupId) : ''
        const isGroupAdmins = groupAdmins.includes(sender.id) || false
        const isBotGroupAdmins = groupAdmins.includes(botNumber) || false

        // Bot Prefix
        const prefix = '#'
        body = (type === 'chat' && body.startsWith(prefix)) ? body : (((type === 'image' || type === 'video') && caption) && caption.startsWith(prefix)) ? caption : ''
        const command = body.slice(1).trim().split(/ +/).shift().toLowerCase()
        const arg = body.substring(body.indexOf(' ') + 1)
        const args = body.trim().split(/ +/).slice(1)
        const isCmd = body.startsWith(prefix)
        const isQuotedImage = quotedMsg && quotedMsg.type === 'image'
        const url = args.length !== 0 ? args[0] : ''
        const uaOverride = process.env.UserAgent

        // [BETA] Avoid Spam Message
        if (isCmd && msgFilter.isFiltered(from) && !isGroupMsg) { return console.log(color('[SPAM]', 'red'), color(moment(t * 1000).format('DD/MM/YY HH:mm:ss'), 'yellow'), color(`${command} [${args.length}]`), 'from', color(pushname)) }
        if (isCmd && msgFilter.isFiltered(from) && isGroupMsg) { return console.log(color('[SPAM]', 'red'), color(moment(t * 1000).format('DD/MM/YY HH:mm:ss'), 'yellow'), color(`${command} [${args.length}]`), 'from', color(pushname), 'in', color(name || formattedTitle)) }
        //
        if (!isCmd && !isGroupMsg) { return console.log('[RECV]', color(moment(t * 1000).format('DD/MM/YY HH:mm:ss'), 'yellow'), 'Message from', color(pushname)) }
        if (!isCmd && isGroupMsg) { return console.log('[RECV]', color(moment(t * 1000).format('DD/MM/YY HH:mm:ss'), 'yellow'), 'Message from', color(pushname), 'in', color(name || formattedTitle)) }
        if (isCmd && !isGroupMsg) { console.log(color('[EXEC]'), color(moment(t * 1000).format('DD/MM/YY HH:mm:ss'), 'yellow'), color(`${command} [${args.length}]`), 'from', color(pushname)) }
        if (isCmd && isGroupMsg) { console.log(color('[EXEC]'), color(moment(t * 1000).format('DD/MM/YY HH:mm:ss'), 'yellow'), color(`${command} [${args.length}]`), 'from', color(pushname), 'in', color(name || formattedTitle)) }
        // [BETA] Avoid Spam Message
        msgFilter.addFilter(from)

        switch (command) {
        // Menu and TnC
        case 'speed':
        case 'ping':
            await client.sendText(from, `Pong!!!!\nSpeed: ${processTime(t, moment())} _Second_`)
            break
        case 'tnc':
            await client.sendText(from, menuId.textTnC())
            break
        case 'menu':
        case 'help':
            await client.sendText(from, menuId.textMenu(pushname))
                .then(() => ((isGroupMsg) && (isGroupAdmins)) ? client.sendText(from, 'Para Ver Los Comandos De Administradores: *#menuadmin*') : null)
            break
        case 'menuadmin':
            if (!isGroupMsg) return client.reply(from, 'Lo sentimos, este comando solo se puede usar dentro del grupo! [Solamente En El Grupo]', id)
            if (!isGroupAdmins) return client.reply(from, 'Este Comando solo lo pueden usar los administradores del grupo! [Solamente Administradores]', id)
            await client.sendText(from, menuId.textAdmin())
            break
        case 'donate':
        case 'donasi':
            await client.sendText(from, menuId.textDonasi())
            break
        // Sticker Creator
        case 'sticker':
        case 'stiker': {
            if ((isMedia || isQuotedImage) && args.length === 0) {
                const encryptMedia = isQuotedImage ? quotedMsg : message
                const _mimetype = isQuotedImage ? quotedMsg.mimetype : mimetype
                const mediaData = await decryptMedia(encryptMedia, uaOverride)
                const imageBase64 = `data:${_mimetype};base64,${mediaData.toString('base64')}`
                client.sendImageAsSticker(from, imageBase64).then(() => {
                    client.reply(from, 'Sticker Creado Ahora Llegale Puto ATT: ☠⃟♛ꊛɴвυѕcα߶̫♛⃟☠⸋⸁ᶜ.')
                    console.log(`Sticker Processed for ${processTime(t, moment())} Second`)
                })
            } else if (args[0] === 'nobg') {
                /**
                * This is Premium feature.
                * Check premium feature at https://trakteer.id/red-emperor/showcase or chat Author for Information.
                */
                client.reply(from, 'ehhh, what\'s that???', id)
            } else if (args.length === 1) {
                if (!is.Url(url)) { await client.reply(from, 'Lo sentimos, el enlace que envió no es válido. [Enlace Invalido]', id) }
                client.sendStickerfromUrl(from, url).then((r) => (!r && r !== undefined)
                    ? client.sendText(from, 'Lo sentimos, el enlace que envió no contiene una imagen. [No Hay Imagen]')
                    : client.reply(from, 'Sticker Creado Puto ATT : ☠⃟♛ꊛɴвυѕcα߶̫♛⃟☠⸋⸁ᶜ')).then(() => console.log(`Sticker Processed for ${processTime(t, moment())} Second`))
            } else {
                await client.reply(from, '¡Sin imagen! Para abrir la lista de comandos enviar. #menu [Formato erróneo]', id)
            }
            break
        }
        case 'stikergif':
        case 'stickergif':
        case 'gifstiker':
        case 'gifsticker': {
            if (args.length !== 1) return client.reply(from, 'Lo sentimos, el formato del mensaje es incorrecto, consulte el menú. [Formato erróneo]', id)
            if (is.Giphy(url)) {
                const getGiphyCode = url.match(new RegExp(/(\/|\-)(?:.(?!(\/|\-)))+$/, 'gi'))
                if (!getGiphyCode) { return client.reply(from, 'Gagal mengambil kode giphy', id) }
                const giphyCode = getGiphyCode[0].replace(/[-\/]/gi, '')
                const smallGifUrl = 'https://media.giphy.com/media/' + giphyCode + '/giphy-downsized.gif'
                client.sendGiphyAsSticker(from, smallGifUrl).then(() => {
                    client.reply(from, 'Sticker Creado Ahora Llegale Puto ATT: ☠⃟♛ꊛɴвυѕcα߶̫♛⃟☠⸋⸁ᶜ.')
                    console.log(`Sticker Processed for ${processTime(t, moment())} Second`)
                }).catch((err) => console.log(err))
            } else if (is.MediaGiphy(url)) {
                const gifUrl = url.match(new RegExp(/(giphy|source).(gif|mp4)/, 'gi'))
                if (!gifUrl) { return client.reply(from, 'No se pudo recuperar el código giphy', id) }
                const smallGifUrl = url.replace(gifUrl[0], 'giphy-downsized.gif')
                client.sendGiphyAsSticker(from, smallGifUrl).then(() => {
                    client.reply(from, 'Sticker Creado Ahora Llegale Puto ATT: ☠⃟♛ꊛɴвυѕcα߶̫♛⃟☠⸋⸁ᶜ.')
                    console.log(`Sticker Processed for ${processTime(t, moment())} Second`)
                }).catch((err) => console.log(err))
            } else {
                await client.reply(from, 'Lo siento, por ahora los stickers con movimiento solo pueden usar el enlace de la pagina GIPHY.  [GIPHY Solamente]', id)
            }
            break
        }
        // Video Downloader
        case 'tiktok':
            if (args.length !== 1) return client.reply(from, 'Lo sentimos, el formato del mensaje es incorrecto, consulte el menú. [Formato erróneo]', id)
            if (!is.Url(url) && !url.includes('tiktok.com')) return client.reply(from, 'Lo sentimos, el enlace que envió no es válido. [Enlace Invalido]', id)
            await client.reply(from, `_Scraping Metadata..._ \n\n${menuId.textDonasi()}`, id)
            downloader.tiktok(url).then(async (videoMeta) => {
                const filename = videoMeta.authorMeta.name + '.mp4'
                const caps = `*Metadata:*\nUsername: ${videoMeta.authorMeta.name} \nMusic: ${videoMeta.musicMeta.musicName} \nView: ${videoMeta.playCount.toLocaleString()} \nLike: ${videoMeta.diggCount.toLocaleString()} \nComment: ${videoMeta.commentCount.toLocaleString()} \nShare: ${videoMeta.shareCount.toLocaleString()} \nCaption: ${videoMeta.text.trim() ? videoMeta.text : '-'}`
                await client.sendFileFromUrl(from, videoMeta.url, filename, videoMeta.NoWaterMark ? caps : `⚠ Video tanpa watermark tidak tersedia. \n\n${caps}`, '', { headers: { 'User-Agent': 'okhttp/4.5.0', referer: 'https://www.tiktok.com/' } }, true)
                    .then((serialized) => console.log(`Envío exitoso de arcivho con id: ${serialized} procesado durante ${processTime(t, moment())}`))
                    .catch((err) => console.error(err))
            }).catch(() => client.reply(from, 'Gagal mengambil metadata, link yang kamu kirim tidak valid. [Invalid Link]', id))
            break
        case 'ig':
        case 'instagram':
            if (args.length !== 1) return client.reply(from, 'Lo sentimos, el formato del mensaje es incorrecto, consulte el menú. [Formato erróneo]', id)
            if (!is.Url(url) && !url.includes('instagram.com')) return client.reply(from, 'Lo sentimos, el enlace que envió no es válido. [Enlace Invalido]', id)
            await client.reply(from, `_Scraping Metadata..._ \n\n${menuId.textDonasi()}`, id)
            downloader.insta(url).then(async (data) => {
                if (data.type == 'GraphSidecar') {
                    if (data.image.length != 0) {
                        data.image.map((x) => client.sendFileFromUrl(from, x, 'photo.jpg', '', null, null, true))
                            .then((serialized) => console.log(`Envío exitoso de archivo con id: ${serialized} procesado durante ${processTime(t, moment())}`))
                            .catch((err) => console.error(err))
                    }
                    if (data.video.length != 0) {
                        data.video.map((x) => client.sendFileFromUrl(from, x.videoUrl, 'video.jpg', '', null, null, true))
                            .then((serialized) => console.log(`Envío exitoso de archivo con id: ${serialized} procesado durante ${processTime(t, moment())}`))
                            .catch((err) => console.error(err))
                    }
                } else if (data.type == 'GraphImage') {
                    client.sendFileFromUrl(from, data.image, 'photo.jpg', '', null, null, true)
                        .then((serialized) => console.log(`Envío exitoso de archivo con id: ${serialized} procesado durante ${processTime(t, moment())}`))
                        .catch((err) => console.error(err))
                } else if (data.type == 'GraphVideo') {
                    client.sendFileFromUrl(from, data.video.videoUrl, 'video.mp4', '', null, null, true)
                        .then((serialized) => console.log(`Envío exitoso de archivo con id: ${serialized} procesado durante ${processTime(t, moment())}`))
                        .catch((err) => console.error(err))
                }
            })
                .catch((err) => {
                    console.log(err)
                    if (err === 'Not a video') { return client.reply(from, 'Error, no hay video en el enlace que enviaste. [Enlace Invalido]', id) }
                    client.reply(from, 'Error, user private atau link salah [Private or Invalid Link]', id)
                })
            break
        case 'twt':
        case 'twitter':
            if (args.length !== 1) return client.reply(from, 'Lo sentimos, el formato del mensaje es incorrecto, consulte el menú. [Formato errónro]', id)
            if (!is.Url(url) & !url.includes('twitter.com') || url.includes('t.co')) return client.reply(from, 'Lo sentimos, la URL que envió no es válida. [Enlace Invalido]', id)
            await client.reply(from, `_Scraping Metadata..._ \n\n${menuId.textDonasi()}`, id)
            downloader.tweet(url).then(async (data) => {
                if (data.type === 'video') {
                    const content = data.variants.filter(x => x.content_type !== 'application/x-mpegURL').sort((a, b) => b.bitrate - a.bitrate)
                    const result = await urlShortener(content[0].url)
                    console.log('Shortlink: ' + result)
                    await client.sendFileFromUrl(from, content[0].url, 'video.mp4', `Link Download: ${result} \n\nProcessed for ${processTime(t, moment())} _Second_`, null, null, true)
                        .then((serialized) => console.log(`Envío exitoso de archivo con id: ${serialized} procesado durante ${processTime(t, moment())}`))
                        .catch((err) => console.error(err))
                } else if (data.type === 'photo') {
                    for (let i = 0; i < data.variants.length; i++) {
                        await client.sendFileFromUrl(from, data.variants[i], data.variants[i].split('/media/')[1], '', null, null, true)
                            .then((serialized) => console.log(`Envío exitoso de archivo con id: ${serialized} procesado durante ${processTime(t, moment())}`))
                            .catch((err) => console.error(err))
                    }
                }
            })
                .catch(() => client.sendText(from, 'Lo sentimos, el enlace no es válido o no hay medios en el enlace que envió. [Enlace Invalido]'))
            break
        case 'fb':
        case 'facebook':
            if (args.length !== 1) return client.reply(from, 'Lo sentimos, el formato del mensaje es incorrecto, consulte el menú. [Formato erróneo]', id)
            if (!is.Url(url) && !url.includes('facebook.com')) return client.reply(from, 'Lo sentimos, la URL que envió no es válida.. [Enlace Invalido]', id)
            await client.reply(from, '_PleMountain..._ \n\nGracias por usar este bot, puedes ayudar al desarrollo de este bot preguntando a través de https://www.facebook.com/PleMountain/ o buscarme por twitter https://twitter.com/PleMountain \nGracias.', id)
            downloader.facebook(url).then(async (videoMeta) => {
                const title = videoMeta.response.title
                const thumbnail = videoMeta.response.thumbnail
                const links = videoMeta.response.links
                const shorts = []
                for (let i = 0; i < links.length; i++) {
                    const shortener = await urlShortener(links[i].url)
                    console.log('Shortlink: ' + shortener)
                    links[i].short = shortener
                    shorts.push(links[i])
                }
                const link = shorts.map((x) => `${x.resolution} Quality: ${x.short}`)
                const caption = `Text: ${title} \n\nLink Download: \n${link.join('\n')} \n\nProcessed for ${processTime(t, moment())} _Second_`
                await client.sendFileFromUrl(from, thumbnail, 'videos.jpg', caption, null, null, true)
                    .then((serialized) => console.log(`Envío exitoso de archivo con id: ${serialized} procesado durante ${processTime(t, moment())}`))
                    .catch((err) => console.error(err))
            })
                .catch((err) => client.reply(from, `Error, la URL no es válida o el video no se carga. [Enlace no válido o sin vídeo] \n\n${err}`, id))
            break
        // Other Command
        case 'meme':
            if ((isMedia || isQuotedImage) && args.length >= 2) {
                const top = arg.split('|')[0]
                const bottom = arg.split('|')[1]
                const encryptMedia = isQuotedImage ? quotedMsg : message
                const mediaData = await decryptMedia(encryptMedia, uaOverride)
                const getUrl = await uploadImages(mediaData, false)
                const ImageBase64 = await meme.custom(getUrl, top, bottom)
                client.sendFile(from, ImageBase64, 'image.png', '', null, true)
                    .then((serialized) => console.log(`Envío exitoso de archivo con id: ${serialized} procesado durante ${processTime(t, moment())}`))
                    .catch((err) => console.error(err))
            } else {
                await client.reply(from, '¡Sin imagen! Para abrir cómo usar enviar #menú [Formato erróneo]', id)
            }
            break
        case 'resi':
            if (args.length !== 2) return client.reply(from, 'Lo sentimos, el formato del mensaje es incorrecto, consulte el menú. [Formato erróneo]', id)
            const kurirs = ['jne', 'pos', 'tiki', 'wahana', 'jnt', 'rpx', 'sap', 'sicepat', 'pcp', 'jet', 'dse', 'first', 'ninja', 'lion', 'idl', 'rex']
            if (!kurirs.includes(args[0])) return client.sendText(from, `Lo sentimos, el tipo de expedición de envío no es compatible. Este servicio solo admite expedición de envíoLo sentimos, el tipo de expedición de envío no es compatible. Este servicio solo admite expedición de envío ${kurirs.join(', ')} Por favor revise de nuevo.`)
            console.log('Memeriksa No Resi', args[1], 'dengan ekspedisi', args[0])
            cekResi(args[0], args[1]).then((result) => client.sendText(from, result))
            break
        case 'translate':
            if (args.length != 1) return client.reply(from, 'Lo sentimos, el formato del mensaje es incorrecto, consulte el menú. [Formato erróneo]', id)
            if (!quotedMsg) return client.reply(from, 'Lo sentimos, el formato del mensaje es incorrecto, consulte el menú. [Formato erróneo]', id)
            const quoteText = quotedMsg.type == 'chat' ? quotedMsg.body : quotedMsg.type == 'image' ? quotedMsg.caption : ''
            translate(quoteText, args[0])
                .then((result) => client.sendText(from, result))
                .catch(() => client.sendText(from, '[Error] Código de idioma incorrecto o problema con el servidor.'))
            break
        case 'ceklok':
        case 'ceklokasi':
            if (!quotedMsg || quotedMsg.type !== 'location') return client.reply(from, 'Lo sentimos, el formato del mensaje es incorrecto, consulte el menú. [Formato erróneo]', id)
            console.log(`Request Status Zona Penyebaran Covid-19 (${quotedMsg.lat}, ${quotedMsg.lng}).`)
            const zoneStatus = await getLocationData(quotedMsg.lat, quotedMsg.lng)
            if (zoneStatus.kode !== 200) client.sendText(from, 'Lo sentimos, hubo un error al verificar la ubicación que envió.')
            let data = ''
            for (let i = 0; i < zoneStatus.data.length; i++) {
                const { zone, region } = zoneStatus.data[i]
                const _zone = zone == 'green' ? 'Hijau* (Aman) \n' : zone == 'yellow' ? 'Kuning* (Waspada) \n' : 'Merah* (Bahaya) \n'
                data += `${i + 1}. Kel. *${region}* Berstatus *Zona ${_zone}`
            }
            const text = `*COMPRUEBE LA UBICACIÓN DE LA DISTRIBUCIÓN COVID-19*\nLos resultados de la inspección de la ubicación que envió son *${zoneStatus.status}* ${zoneStatus.optional}\n\nInformación de ubicación afectada cerca de usted:\n${data}`
            client.sendText(from, text)
            break
        // Group Commands (group admin only)
        case 'kick':
            if (!isGroupMsg) return client.reply(from, 'Lo sentimos, ¡este comando solo se puede usar dentro de grupos! [Solamente en el grupo]', id)
            if (!isGroupAdmins) return client.reply(from, 'Falló, este comando solo puede ser utilizado por los administradores del grupo. [Comando De Administradores.]', id)
            if (!isBotGroupAdmins) return client.reply(from, 'Falló, agregue el bot como administrador del grupo. [El Bot No Es Administrador.]', id)
            if (mentionedJidList.length === 0) return client.reply(from, 'Lo sentimos, el formato del mensaje es incorrecto, consulte el menú. [Formato erróneo]', id)
            if (mentionedJidList[0] === botNumber) return await client.reply(from, 'Lo sentimos, el formato del mensaje es incorrecto, consulte el menú. [Formato erróneo]', id)
            await client.sendTextWithMentions(from, `Solicitud recibida, emitida:\n${mentionedJidList.map(x => `@${x.replace('@c.us', '')}`).join('\n')}`)
            for (let i = 0; i < mentionedJidList.length; i++) {
                if (groupAdmins.includes(mentionedJidList[i])) return await client.sendText(from, 'Error, no puedes eliminar a el creador del grupo...')
                await client.removeParticipant(groupId, mentionedJidList[i])
            }
            break
        case 'promote':
            if (!isGroupMsg) return await client.reply(from, 'Lo sentimos, este comando solo se puede usar dentro del grupo! [Solamente En El Gurpo]', id)
            if (!isGroupAdmins) return await client.reply(from, 'Falló, este comando solo puede ser utilizado por los administradores del grupo. [Comando De Administrador]', id)
            if (!isBotGroupAdmins) return await client.reply(from, 'Falló, agregue el bot como administrador del grupo. [El Bot No Es Administrador.]', id)
            if (mentionedJidList.length != 1) return client.reply(from, 'Lo sentimos, el formato del mensaje es incorrecto, consulte el menú. [Formato incorrecto, solo 1 usuario]', id)
            if (groupAdmins.includes(mentionedJidList[0])) return await client.reply(from, 'Lo siento, ese usuario ya es administrador. [El Bot Es dministrador]', id)
            if (mentionedJidList[0] === botNumber) return await client.reply(from, 'Lo sentimos, el formato del mensaje es incorrecto, consulte el menú. [Formato erróneo]', id)
            await client.promoteParticipant(groupId, mentionedJidList[0])
            await client.sendTextWithMentions(from, `Request diterima, menambahkan @${mentionedJidList[0].replace('@c.us', '')} sebagai admin.`)
            break
        case 'demote':
            if (!isGroupMsg) return client.reply(from, 'Lo sentimos, ¡este comando solo se puede usar dentro de grupos! [Solamente en el grupo]', id)
            if (!isGroupAdmins) return client.reply(from, 'Falló, este comando solo puede ser utilizado por los administradores del grupo. [Comando De Administradores.]', id)
            if (!isBotGroupAdmins) return client.reply(from, 'Falló, agregue el bot como administrador del grupo. [El Bot No Es Administrador.]', id)
            if (mentionedJidList.length !== 1) return client.reply(from, 'Lo sentimos, el formato del mensaje es incorrecto, consulte el menú. [Formato incorrecto, solo 1 usuario]', id)
            if (!groupAdmins.includes(mentionedJidList[0])) return await client.reply(from, 'Lo sentimos, el usuario no es un administrador. [El usuario no es administrador]', id)
            if (mentionedJidList[0] === botNumber) return await client.reply(from, 'Lo sentimos, el formato del mensaje es incorrecto, consulte el menú. [Formato erróneo]', id)
            await client.demoteParticipant(groupId, mentionedJidList[0])
            await client.sendTextWithMentions(from, `Request diterima, menghapus jabatan @${mentionedJidList[0].replace('@c.us', '')}.`)
            break
        case 'bye':
            if (!isGroupMsg) return client.reply(from, 'Lo sentimos, este comando solo se puede usar dentro del grupo! [Solamente En El Gurpo]', id)
            if (!isGroupAdmins) return client.reply(from, 'Falló, este comando solo puede ser utilizado por los administradores del grupo! [Comando De Administrador]', id)
            client.sendText(from, 'Good bye... ( ⇀‸↼‶ )').then(() => client.leaveGroup(groupId))
            break
        case 'del':
            if (!isGroupAdmins) return client.reply(from, 'Falló, este comando solo puede ser utilizado por los administradores del grupo. [Comando De Administrador]', id)
            if (!quotedMsg) return client.reply(from, 'Lo sentimos, el formato del mensaje es incorrecto, consulte el menú. [Formato erróneo]', id)
            if (!quotedMsgObj.fromMe) return client.reply(from, 'Lo sentimos, el formato del mensaje es incorrecto, consulte el menú. [Formato erróneo]', id)
            client.deleteMessage(quotedMsgObj.chatId, quotedMsgObj.id, false)
            break
        case 'tagall':
        case 'everyone':
            /**
            * This is Premium feature.
            * Check premium feature at https://trakteer.id/red-emperor/showcase or chat Author for Information.
            */
            client.reply(from, 'ehhh, what\'s that??? \n Check premium feature at https://trakteer.id/red-emperor/showcase or chat Author for Information', id)
            break
        case 'botstat': {
            const loadedMsg = await client.getAmountOfLoadedMessages()
            const chatIds = await client.getAllChatIds()
            const groups = await client.getAllGroups()
            client.sendText(from, `Status :\n- *${loadedMsg}* Loaded Messages\n- *${groups.length}* Group Chats\n- *${chatIds.length - groups.length}* Personal Chats\n- *${chatIds.length}* Total Chats`)
            break
        }
        default:
            console.log(color('[ERROR]', 'red'), color(moment(t * 1000).format('DD/MM/YY HH:mm:ss'), 'yellow'), 'Unregistered Command from', color(pushname))
            break
        }
    } catch (err) {
        console.error(color(err, 'red'))
    }
}
