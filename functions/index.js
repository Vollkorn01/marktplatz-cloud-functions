const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { firestore } = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

exports.sendNotificationToTopic = functions.firestore.document('CHATS/{chatId}/MESSAGES/{messageId}').onWrite(async (event) => {
    //let docID = event.after.id;
    // let title = event.after.get('title');

    console.log('event.after', event.after)

    // get uid from MESSAGES
    let uid = event.after.get('user')._id;
    console.log('uid', uid)


    //get userRef with fcmToken
    var fcmToken = firestore.document('USERS/'+uid).get('fcmToken')
    console.log('userRef', userRef)
    

    // var user = admin.auth().getUser('0wP2yO2hhqTWFXlDDeV3WLUS5dg1')
    // .then((userRecord) => {
    //   // See the UserRecord reference doc for the contents of userRecord.
    //   console.log('Successfully fetched user data:', userRecord.toJSON());
    //   return userRecord.toJSON()
    // })
    // .catch((error) => {
    //   console.log('Error fetching user data:', error);
    // });


    var message = {
        notification: {
            title: 'title',
            body: 'content',
        },
        token: fcmToken,
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