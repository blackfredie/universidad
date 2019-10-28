// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { ActivityHandler } = require('botbuilder');
const { QnAMaker } = require('botbuilder-ai');

class QnABot extends ActivityHandler {
    constructor() {
        super();

        try {
            this.qnaMaker = new QnAMaker({
                knowledgeBaseId: process.env.QnAKnowledgebaseId,
                endpointKey: process.env.QnAEndpointKey,
                host: process.env.QnAEndpointHostName
            });
        } catch (err) {
            console.warn(`QnAMaker Exception: ${ err } Check your QnAMaker configuration in .env`);
        }

        // defineel primer mensaje del bot 
        this.onMembersAdded(async (context, next) => {
            const membersAdded = context.activity.membersAdded;
            for (let cnt = 0; cnt < membersAdded.length; cnt++) {
                if (membersAdded[cnt].id !== context.activity.recipient.id) {
                    await context.sendActivity('Hola, en que te podemos ayudar?');
                }
            }

            // By calling next() you ensure that the next BotHandler is run.
            await next();
        });

        // cuando el estudiante envia una consulta  QnA Maker service verifica la informacion en azure.
        this.onMessage(async (context, next) => {
            if (!process.env.QnAKnowledgebaseId || !process.env.QnAEndpointKey || !process.env.QnAEndpointHostName) {
                let unconfiguredQnaMessage = 'NOTE: \r\n' + 
                    'No entiendo tu pregunta' +
                    'si necesitas mas informacion puedes llamar a nuestra linea de servicio al cliente 800-0606.'

                 await context.sendActivity(unconfiguredQnaMessage)
            }
            else {
                console.log('Verificando en QNA azure');
    
                const qnaResults = await this.qnaMaker.getAnswers(context);
    
                // If an answer was received from QnA Maker, send the answer back to the user.
                if (qnaResults[0]) {
                    await context.sendActivity(qnaResults[0].answer);
    
                // If no answers were returned from QnA Maker, reply with help.
                } else {
                    await context.sendActivity('No entiendo tu pregunta, puedes escribir cosas como matricula, sede, etc. si necesitas mas informacion puedes llamar a nuestra linea de servicio al cliente 800-0606');
                }
    
            }
            
            // By calling next() you ensure that the next BotHandler is run.
            await next();
        });
    }
}

module.exports.QnABot = QnABot;
