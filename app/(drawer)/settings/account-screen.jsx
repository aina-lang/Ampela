import React from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';
import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';

const BACKGROUND_FETCH_TASK = 'background-fetch';

// Define the background fetch task function
async function backgroundFetchTask() {
  try {
    const now = Date.now();
    console.log(`Got background fetch call at date: ${new Date(now).toISOString()}`);
    // Simulate fetching data from a server
    await new Promise(resolve => setTimeout(resolve, 1000));
    // Be sure to return the successful result type!
    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (err) {
    console.error(err);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
}

// Register the task with TaskManager
TaskManager.defineTask(BACKGROUND_FETCH_TASK, backgroundFetchTask);

// Register the task
async function registerBackgroundFetchAsync() {
  try {
    await BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
      minimumInterval: 1, // 1 minute for testing, adjust as needed
      stopOnTerminate: false, // android only
      startOnBoot: true, // android only
    });
    console.log('Task registered');
  } catch (err) {
    console.error('Task registration failed:', err);
  }
}

// Unregister the task
async function unregisterBackgroundFetchAsync() {
  try {
    await BackgroundFetch.unregisterTaskAsync(BACKGROUND_FETCH_TASK);
    console.log('Task unregistered');
  } catch (err) {
    console.error('Task unregistration failed:', err);
  }
}

// Manual trigger for testing
async function triggerBackgroundFetchTask() {
  console.log('Manually triggering background fetch task');
  const result = await backgroundFetchTask();
  console.log(`Manual trigger result: ${result}`);
}

export default function BackgroundFetchScreen() {
  const [isRegistered, setIsRegistered] = React.useState(false);
  const [status, setStatus] = React.useState(null);

  React.useEffect(() => {
    checkStatusAsync();
  }, []);

  const checkStatusAsync = async () => {
    const status = await BackgroundFetch.getStatusAsync();
    const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_FETCH_TASK);
    setStatus(status);
    setIsRegistered(isRegistered);
  };

  const toggleFetchTask = async () => {
    if (isRegistered) {
      await unregisterBackgroundFetchAsync();
    } else {
      await registerBackgroundFetchAsync();
    }

    checkStatusAsync();
  };

  return (
    <View style={styles.screen}>
      <View style={styles.textContainer}>
        <Text>
          Background fetch status:{' '}
          <Text style={styles.boldText}>
            {status !== null ? BackgroundFetch.BackgroundFetchStatus[status] : 'Unknown'}
          </Text>
        </Text>
        <Text>
          Background fetch task name:{' '}
          <Text style={styles.boldText}>
            {isRegistered ? BACKGROUND_FETCH_TASK : 'Not registered yet!'}
          </Text>
        </Text>
      </View>
      <Button
        title={isRegistered ? 'Unregister BackgroundFetch task' : 'Register BackgroundFetch task'}
        onPress={toggleFetchTask}
      />
      <Button
        title="Trigger BackgroundFetch task manually"
        onPress={triggerBackgroundFetchTask}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    margin: 10,
  },
  boldText: {
    fontWeight: 'bold',
  },
});
