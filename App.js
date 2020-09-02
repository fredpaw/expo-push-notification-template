import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { StyleSheet, Button, Text, View } from "react-native";
import * as Notifications from "expo-notifications";
import * as Permissions from "expo-permissions";

Notifications.setNotificationHandler({
  handleNotification: async () => {
    return {
      shouldShowAlert: true,
    };
  },
});

export default function App() {
  const [pushToken, setPushToken] = useState();

  useEffect(() => {
    Permissions.getAsync(Permissions.NOTIFICATIONS)
      .then((statusObj) => {
        if (statusObj.status !== "granted") {
          return Permissions.askAsync(Permissions.NOTIFICATIONS);
        }
        return statusObj;
      })
      .then((statusObj) => {
        if (statusObj.status !== "granted") {
          throw new Error("Permission not granted!");
        }
      })
      .then(() => {
        return Notifications.getExpoPushTokenAsync();
      })
      .then((response) => {
        console.log(response.data);
        const token = response.data;
        setPushToken(token);
      })
      .catch((err) => null);
  }, []);

  useEffect(() => {
    const backSubscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log(response);
      }
    );

    const foreSubscription = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log(notification);
      }
    );

    return () => {
      backSubscription.remove();
      foreSubscription.remove();
    };
  }, []);

  const triggerNotificationHandler = () => {
    // Notifications.scheduleNotificationAsync({
    //   content: {
    //     title: "My first local notification",
    //     body: "This is the first local notification we are sending!",
    //   },
    //   trigger: {
    //     seconds: 10,
    //   },
    // });
    fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      header: {
        Accept: "application/json",
        "Accept-Encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: pushToken,
        data: { extraData: "Some data" },
        title: "Send via the app",
        body: "This push notification was send via the app!",
      }),
    });
  };

  return (
    <View style={styles.container}>
      <Button
        title="Trigger Notification"
        onPress={triggerNotificationHandler}
      />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
