const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { firestore } = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

exports.sendNotificationToTopic = functions.firestore.document('CHATS/{chatId}/MESSAGES/{messageId}').onWrite(async (event) => {
    //let docID = event.after.id;
    // let title = event.after.get('title');

    console.log('event.after', event.after)

    // get message text
    let messageText = event.after.get('text');

    // get uid from user that wrote the message
    let uidSender = event.after.get('user')._id;

    // get uid and name from user that requested the item
    let requester = event.after.get('requester');
    let uidRequester = requester.uid;
    let nameRequester = requester.displayName;

    // get uid and name from user that created the item
    let createdBy = event.after.get('createdBy');
    let uidCreatedBy = createdBy.uid;
    let nameCreatedBy = createdBy.displayName;


    // who is the receiver?
    let uidReceiver;
    let nameReceiver;
    if (uidSender === uidRequester) {
      // send message to uidCreatedBy
      uidReceiver = uidCreatedBy
      nameReceiver = nameCreatedBy
    } else if (uidSender === uidCreatedBy) {
      // send message to uidRequester
      uidReceiver = uidRequester
      nameReceiver = nameRequester
    } else {
      console.log('Error: uidSender doesnt match, should never be the case')
    }


    if (uidReceiver) {
      let fcmToken;
      const userDoc = firestore().collection('USERS').doc(uidReceiver);
      const doc = await userDoc.get();
      if (!doc.exists) {
        console.log('No such document!');
      } else {
        console.log('Document data:', doc.data());
        fcmToken = doc.data().fcmToken
      }

      if (fcmToken) {
      

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
              title: nameReceiver,
              body: messageText,
          },
          token: fcmToken,
      };



      let response = await admin.messaging().send(message);
      console.log(response);
      console.log('uidReceiver', uidReceiver)
    }
  }
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