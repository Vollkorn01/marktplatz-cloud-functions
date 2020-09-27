const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

exports.sendNotificationToTopic = functions.firestore.document('CHATS/{chatId}/MESSAGES/{messageId}').onWrite(async (event) => {
    //let docID = event.after.id;
    // let title = event.after.get('title');
    // let content = event.after.get('content');
    var registrationToken = 'fijJdl0IF0vgjx9_fJzQTA:APA91bGUnw_m3ru70BZ8-nmOddRyimbbdrahEB4y54I5DbUfn-aMTKbVXtr1fJ8uGhG1CQif8wHfV2PVBm-APZEbjS9zPd3BXhPw8M7DM_QMSCU2t3XWgIJ7SkRxDhsOV8G2cJuhu6eu';
    var message = {
        notification: {
            title: 'title',
            body: 'content',
        },
        token: registrationToken,
    };

    let response = await admin.messaging().send(message);
    console.log(response);
});

// exports.sendNotificationToFCMToken = functions.firestore.document('messages/{mUid}').onWrite(async (event) => {
//     const uid = event.after.get('userUid');
//     const title = event.after.get('title');
//     const content = event.after.get('content');
//     let userDoc = await admin.firestore().doc(`users/${uid}`).get();
//     let fcmToken = userDoc.get('fcm');

//     var message = {
//         notification: {
//             title: title,
//             body: content,
//         },
//         token: fcmToken,
//     }

//     let response = await admin.messaging().send(message);
//     console.log(response);
// });