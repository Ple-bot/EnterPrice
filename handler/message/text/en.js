exports.textTnC = () => {
    return `
El codigo fuente / bot es un programa de código abierto (gratuito) escrito con Javascript, puede usar, copiar, modificar, combinar, publicar, distribuir, sublicenciar o vender copias sin eliminar el autor principal del código fuente / bot.
Al usar este código fuente / bot, acepta los siguientes términos y condiciones:
- El Código fuente / bot no almacena sus datos en nuestros servidores.
- El código fuente / bot no es responsable de los stickers que usted crea con este bot y los videos, imágenes y otros datos que obtiene del código fuente / bot.
- El código fuente / bot no se puede utilizar para servicios que tienen como objetivo / contribuyen a:
    • sexo / trata de personas
    • juegos de azar
    • comportamiento adictivo dañino
    • crimen
    • violencia (A MENOS QUE SEA NECESARIA PARA PROTEGER LA SEGURIDAD PÚBLICA)
    • quema de bosques / defirestación
    • discurso de odio o discriminación por motivos de edad, sexo, identidad de género, raza, sexualidad, religión, nacionalidad.

Source Code BOT: https://github.com/YogaSakti/imageToSticker
NodeJS WhatsApp library: https://github.com/open-wa/wa-automate-nodejs

Best regards, Yoga Sakti.`
}

exports.textMenu = (pushname) => {
    return `
Buenas, ${pushname || ''} Como estas?
Soy Ple Y Este Es Mi BOT!!✨

Creador de sticker:
1. *#sticker*
Para hacer un sticker
Solo tienes que mandar una foto y poner: #sticker o tambien alguna imagen que hayan enviado y pones #sticker

2. *#stickers* _<Imagen Url>_
Tambien puedes crear stickers con imagenes en linea de la siguiente manera: www.google.com/ejemplo

3. *#gifsticker* _<Gif URL>_ / *#stickergif* _<Gif URL>_
Puedes crear sticker con movimiento tambien, pero OJO (SOLAMENTE IMAGENES SUBIDAS A LA PAGINA GIPHY) EJEMPLO : #gifsticker https://media.giphy.com/media/JUvI2c1ddyzkwK4RlV/giphy.gif

Downloader:
1. *#tiktok* _<Tiktok url>_
Tambien puedo descargar videos de tiktok
Solo tienes que escribir en el chat siguiente formato: #tiktok https://www.tiktok.com/@itsandani/video/6869248690381425922 

2. *#fb* _<post / video url>_
Para mandar videos de Facebook
Escribe como se muestra en el ejemplo: #fb https://www.facebook.com/.....

3. *#ig* _<Instagram post url>_
Compartir Publicaciones de instagram
Aqui te muestro un ejemplo: #ig https://www.instagram.com/p/BPOd1vhDMIp/

4. *#twt* _<Twitter post url>_
Tambien permito enviar publicaciones e imagenes de twitter
Solo tienes que seguir el formato #twt https://twitter.com/ntsana_/status/1306108656887324672

Etc:
1. *#tnc*
terminos y condiciones de este BOT.

Que tengas un grandiosos día !✨`
}

exports.textAdmin = () => {
    return `
⚠ [ *Comandos Solo Para Administradores* ] ⚠ 
Estos son los comandos de administrador que tiene este BOT!

1. *#kick* @usuario
Expulsar a un miembro del grupo (can be more than 1).

2. *#promote* @usuario
Darle administración a un miembro del grupo.

3. *#demote* @usuario
Quitarle administración a un miembro del grupo.

3. *#tagall*
Menciona a todos los miembros del grupo.`
}
