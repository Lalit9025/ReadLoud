import React, { useState } from 'react';
import { View, TextInput, Button, FlatList, Text, StyleSheet } from 'react-native';
import Toast from 'react-native-toast-message';
import * as Speech from 'expo-speech';
import axios from 'axios';

const Home = () => {
  const [url, setUrl] = useState('');
  const [urls, setUrls] = useState([]);
  const [summaries, setSummaries] = useState({});
  const [speakingUrl, setSpeakingUrl] = useState(null);

  const addUrl = () => {
    const trimmedUrl = url.trim();

    if (trimmedUrl === '') {
      Toast.show({
        type: 'error',
        text1: 'Invalid URL',
        text2: 'Please enter a valid URL.',
      });
      return;
    }

    if (urls.includes(trimmedUrl)) {
      Toast.show({
        type: 'info',
        text1: 'Duplicate URL',
        text2: 'This URL has already been added.',
      });
      return;
    }

    setUrls([...urls, trimmedUrl]);
    setUrl('');
    Toast.show({
      type: 'success',
      text1: 'URL Added',
      text2: 'The URL has been added successfully!',
    });
  };

  const fetchAndReadSummary = async (url) => {
    if (speakingUrl) {
      Speech.stop();
      if (speakingUrl === url) {
        setSpeakingUrl(null);
        Toast.show({
          type: 'info',
          text1: 'Stopped',
          text2: 'Text-to-speech has been stopped.',
        });
        return; 
      }
    }

    try {
      console.log('Fetching summary for URL:', url);
      const response = await axios.get('http://10.81.18.135:8080/summarize', { params: { url } });
      const summary = response.data.cleanedContent || '';
      console.log('Summary:', summary);

      if (summary.length === 0) {
        Toast.show({
          type: 'info',
          text1: 'No Content',
          text2: 'No meaningful content found to read aloud.',
        });
        return;
      }

      setSummaries((prev) => ({ ...prev, [url]: summary }));

      const textToRead = summary.length > 4000 ? summary.substring(0, 4000) : summary;
      setSpeakingUrl(url);
      Speech.speak(textToRead, {
        onDone: () => {
          setSpeakingUrl(null);
          Toast.show({
            type: 'success',
            text1: 'Done',
            text2: 'Text-to-speech has completed.',
          });
        },
        onError: (error) => {
          console.error('Error during speech:', error);
          setSpeakingUrl(null);
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: 'An error occurred during text-to-speech.',
          });
        },
      });
    } catch (error) {
      console.error('Error fetching summary or speaking:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to fetch content or read aloud.',
      });
    }
  };

  const truncateUrl = (url, maxLength = 50) => {
    if (url.length <= maxLength) return url;
    return `${url.substring(0, maxLength)}...`;
  };

  return (
    <View style={styles.container}>
      <TextInput
        value={url}
        onChangeText={setUrl}
        placeholder="Enter URL"
        style={styles.input}
      />
      <Button title="Add URL" onPress={addUrl} />
      <FlatList
          style={styles.urlList}
          data={urls.slice().reverse()}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={styles.urlContainer}>
              <Text style={styles.urlText}>{truncateUrl(item)}</Text>
              <Button
                title={speakingUrl === item ? "Stop" : "Read Aloud"}
                onPress={() => fetchAndReadSummary(item)}
                color="rgb(98 161 189)"
              />
            </View>
          )}
      />

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 80,
    paddingHorizontal: 20,
    flex: 1,
  },
  input: {
    borderBottomWidth: 1,
    marginBottom: 10,
  },
  urlList: {
    marginTop: 30,
  },
  urlContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
    backgroundColor: 'rgb(211 220 224)',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  urlText: {
    flex: 1,
    marginRight: 10,
  },
});

export default Home;
