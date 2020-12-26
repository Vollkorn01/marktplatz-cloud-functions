const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { firestore } = require('firebase-admin');

admin.initializeApp(functions.config().firebase);

exports.sendNotificationToTopic = functions.firestore
  .document('ITEMS/{itemID}/CHATS/{chatId}/MESSAGES/{messageId}')
  .onWrite(async (event) => {
    //let docID = event.after.id;
    // let title = event.after.get('title');

    console.log('event.after', event.after);

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
    let nameSender;
    if (uidSender === uidRequester) {
      // send message to uidCreatedBy
      uidReceiver = uidCreatedBy;
      nameSender = nameRequester;
      console.log(
        'SENDER === REQUESTER: uidSender, uidReceiver, nameSender',
        uidSender,
        uidReceiver,
        nameSender,
      );
    } else if (uidSender === uidCreatedBy) {
      // send message to uidRequester
      uidReceiver = uidRequester;
      nameSender = nameCreatedBy;
      console.log(
        'SENDER === CREATOR: uidSender, uidReceiver, nameSender',
        uidSender,
        uidReceiver,
        nameSender,
      );
    } else {
      console.log('Error: uidSender doesnt match, should never be the case');
    }

    if (uidReceiver) {
      let fcmToken;
      const userDoc = firestore().collection('USERS').doc(uidReceiver);
      const doc = await userDoc.get();
      if (!doc.exists) {
        console.log('No such document!');
      } else {
        console.log('Document data:', doc.data());
        fcmToken = doc.data().fcmToken;
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
            title: nameSender,
            body: messageText,
          },
          token: fcmToken,
        };

        let response = await admin.messaging().send(message);
        console.log(response);
        console.log('uidReceiver', uidReceiver);
      }
    }
  });

exports.sendNotificationWhenGivenItem = functions.firestore
  .document('ITEMS/{itemID}')
  .onWrite(async (event) => {
    //let docID = event.after.id;
    // let title = event.after.get('title');

    // get uid and name from user that created the item
    let createdBy = event.after.get('createdBy');
    let nameCreatedBy = createdBy.displayName;

    // notification text
    const messageText = 'Du hast etwas von ' + nameCreatedBy + ' bekommen!  🥳🤩🙌';

    // to whom object has been given?
    let givenTo = event.after.get('givenTo');
    console.log('givenTo', givenTo);
    // who is the receiver of the notification?
    if (givenTo !== '') {
      let fcmToken;
      const userDoc = firestore().collection('USERS').doc(givenTo);
      const doc = await userDoc.get();
      if (!doc.exists) {
        console.log('No such document!');
      } else {
        fcmToken = doc.data().fcmToken;
        console.log('fcmToken', fcmToken);
      }

      if (fcmToken) {
        var message = {
          notification: {
            title: 'Jucheee!',
            body: messageText,
          },
          token: fcmToken,
        };

        let response = await admin.messaging().send(message);
        console.log(response);
      }
    }
  });
