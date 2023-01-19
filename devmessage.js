
export function sendDevMessage() 
{
    if( game.user.isGM ) {
        let jqxhr = $.getJSON( "https://raw.githubusercontent.com/bithir/gm-notes/master/msgdata/data.json", function(data) 
        {                    
            let latestVersion = game.settings.get("gm-notes", 'devMessageVersionNumber');
            if(isNaN(latestVersion)) {
                latestVersion = 0;
            }
            if(data.messages === undefined || data.messages === null || data.messages.length === undefined) {
                return;
            }

            for(let i = 0; i < data.messages.length; i++)
            {
                let msgenvelope = data.messages[i];
                if( msgenvelope.version > latestVersion )
                {
                    ChatMessage.create(
                    {
                        speaker: ChatMessage.getSpeaker({alias: "GM Notes News"}),
                        whisper: [game.user],
                        content: msgenvelope.message        
                    });        
                }
                latestVersion = Math.max(latestVersion, msgenvelope.version);
            }
            console.log("Message system - latestVersion message after "+latestVersion);
            game.settings.set("gm-notes", 'devMessageVersionNumber', latestVersion);
        })
        .fail(function(data) {
            console.error("Could not retreive GM Notes mods news Message:"+JSON.stringify(data));
        });
    }    
}