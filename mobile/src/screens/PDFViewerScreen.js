import React from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Text,
  Platform,
  Linking,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { getBaseUrl } from '../utils/config';

// HTML generator utilizing Mozilla's PDF.js to render PDF files inside WebView on Android.
// This resolves LAN/localhost preview failures on Android by loading files directly from the
// client's local connection and rendering them on canvas, bypassing the need for external Google Doc servers.
const getPdfjsHtml = (pdfUrl, themeBgColor) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=yes">
  <title>PDF Viewer</title>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js"></script>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: ${themeBgColor};
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }
    #canvas-container {
      width: 100%;
      box-sizing: border-box;
      padding: 12px;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    canvas {
      width: 100%;
      max-width: 100%;
      height: auto;
      display: block;
      margin-bottom: 16px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.18);
      border-radius: 8px;
      background-color: #ffffff;
    }
    #loading {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: #64748B;
      font-weight: 600;
      font-size: 15px;
      text-align: center;
    }
  </style>
</head>
<body>
  <div id="loading">Loading Document...</div>
  <div id="canvas-container"></div>

  <script>
    const url = '${pdfUrl}';
    const pdfjsLib = window['pdfjs-dist/build/pdf'];
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';

    const container = document.getElementById('canvas-container');
    const loading = document.getElementById('loading');

    pdfjsLib.getDocument(url).promise.then(function(pdfDoc) {
      loading.style.display = 'none';
      
      // Render pages sequentially to conserve memory
      let renderPromise = Promise.resolve();
      for (let num = 1; num <= pdfDoc.numPages; num++) {
        renderPromise = renderPromise.then(() => renderPage(pdfDoc, num));
      }
    }).catch(function(err) {
      loading.textContent = 'Error rendering PDF: ' + err.message;
      loading.style.color = '#EF4444';
      console.error(err);
    });

    function renderPage(pdfDoc, num) {
      return pdfDoc.getPage(num).then(function(page) {
        const canvas = document.createElement('canvas');
        container.appendChild(canvas);
        const ctx = canvas.getContext('2d');

        // Render at high scale (1.5x) for crystal-clear text on high-DPI screens
        const viewport = page.getViewport({ scale: 1.5 });
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
          canvasContext: ctx,
          viewport: viewport
        };
        return page.render(renderContext).promise;
      });
    }
  </script>
</body>
</html>
`;

const PDFViewerScreen = ({ route, navigation }) => {
  const { url, title, allowDownload = false } = route.params || {};
  const { isDarkMode } = useSelector((state) => state.theme);
  const { user } = useSelector((state) => state.auth);
  const isAdmin = user?.role === 'admin';
  
  const fullUrl = url.startsWith('http') ? url : `${getBaseUrl().replace('/api', '')}${url}`;

  const themeColors = {
    background: isDarkMode ? '#0F172A' : '#F8FAFC',
    card: isDarkMode ? '#1E293B' : '#FFFFFF',
    text: isDarkMode ? '#F8FAFC' : '#1E293B',
    textMuted: isDarkMode ? '#94A3B8' : '#64748B',
    border: isDarkMode ? '#334155' : '#E2E8F0',
    primary: '#4F46E5',
    error: '#EF4444',
  };

  const handleOpenExternally = async () => {
    try {
      const supported = await Linking.canOpenURL(fullUrl);
      if (supported) {
        await Linking.openURL(fullUrl);
      } else {
        Alert.alert('Unable to Open', 'Your device does not support opening this PDF link directly.');
      }
    } catch (error) {
      console.warn(error);
      Alert.alert('Error', 'An error occurred while trying to open the document externally.');
    }
  };

  // Rendering PDF for Web Browsers (resolves react-native-webview crash)
  if (Platform.OS === 'web') {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: themeColors.card, borderBottomColor: themeColors.border }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={themeColors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: themeColors.text }]} numberOfLines={1}>
            {title}
          </Text>
          {(allowDownload || isAdmin) && (
            <TouchableOpacity 
              onPress={handleOpenExternally} 
              style={[styles.actionBtn, { backgroundColor: isDarkMode ? '#33415530' : '#4F46E510' }]}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="open-in-new" size={22} color={themeColors.primary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Web Iframe Content Area */}
        <View style={styles.contentArea}>
          <iframe
            src={fullUrl}
            style={styles.webFrame}
            title={title}
          />

          {/* Floating Brand Watermark Overlay */}
          <View style={styles.watermarkContainer} pointerEvents="none">
            <Image
              source={require('../../assets/logo.png')}
              tintColor="#4F46E5"
              style={styles.watermarkLogo}
              resizeMode="contain"
            />
            <Text style={styles.watermarkText}>SPARDHAPATH</Text>
            <Text style={styles.watermarkSubText}>STUDY MATERIAL</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Rendering PDF for Native Mobile (Android/iOS)
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: themeColors.card, borderBottomColor: themeColors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={themeColors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: themeColors.text }]} numberOfLines={1}>
          {title}
        </Text>
        {(allowDownload || isAdmin) && (
          <TouchableOpacity 
            onPress={handleOpenExternally} 
            style={[styles.actionBtn, { backgroundColor: isDarkMode ? '#33415530' : '#4F46E510' }]}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="open-in-new" size={22} color={themeColors.primary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Mobile PDF Content Area */}
      <View style={styles.contentArea}>
        <WebView
          source={Platform.OS === 'android' ? { html: getPdfjsHtml(fullUrl, themeColors.background) } : { uri: fullUrl }}
          style={[styles.webview, { backgroundColor: themeColors.background }]}
          startInLoadingState={true}
          renderLoading={() => (
            <View style={[styles.loading, { backgroundColor: themeColors.background }]}>
              <ActivityIndicator size="large" color={themeColors.primary} />
              <Text style={[styles.loadingText, { color: themeColors.textMuted }]}>Loading Document...</Text>
            </View>
          )}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          allowFileAccess={true}
          allowUniversalAccessFromFileURLs={true}
          originWhitelist={['*']}
          mixedContentMode="always"
          allowsFullscreenVideo={true}
          scalesPageToFit={true}
        />

        {/* Floating Brand Watermark Overlay */}
        <View style={styles.watermarkContainer} pointerEvents="none">
          <Image
            source={require('../../assets/logo.png')}
            tintColor="#4F46E5"
            style={styles.watermarkLogo}
            resizeMode="contain"
          />
          <Text style={styles.watermarkText}>SPARDHAPATH</Text>
          <Text style={styles.watermarkSubText}>STUDY MATERIAL</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { 
    height: 60, 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
  },
  backBtn: { padding: 5 },
  headerTitle: { fontSize: 16, fontWeight: '700', flex: 1, marginLeft: 16 },
  actionBtn: { 
    padding: 8, 
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentArea: { flex: 1, position: 'relative' },
  webview: { flex: 1 },
  webFrame: {
    width: '100%',
    height: '100%',
    borderWidth: 0,
    border: 'none',
  },
  loading: { 
    ...StyleSheet.absoluteFillObject, 
    justifyContent: 'center', 
    alignItems: 'center', 
    zIndex: 10,
  },
  loadingText: { marginTop: 12, fontSize: 14, fontWeight: '600', letterSpacing: 0.5 },
  
  // Watermark styles
  watermarkContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.1,
    transform: [{ rotate: '-30deg' }],
  },
  watermarkLogo: {
    width: 160,
    height: 160,
    marginBottom: 6,
  },
  watermarkText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#4F46E5',
    letterSpacing: 2.5,
  },
  watermarkSubText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#4F46E5',
    letterSpacing: 2,
    marginTop: 4,
  },
});

export default PDFViewerScreen;
