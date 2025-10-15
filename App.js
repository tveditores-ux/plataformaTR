import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import Voice from '@react-native-voice/voice';

// Componentes
import VoiceInput from './src/components/VoiceInput';
import TradingSection from './src/components/TradingSection';
import Plan21Section from './src/components/Plan21Section';

// Utils
import { processVoiceInput } from './src/utils/voiceProcessor';
import { saveData, loadData } from './src/utils/storage';

// Estilos
import styles from './src/styles/styles';

const App = () => {
  const [activeTab, setActiveTab] = useState('trading');
  const [isListening, setIsListening] = useState(false);
  const [activeInput, setActiveInput] = useState(null);

  const [tradingData, setTradingData] = useState({
    fecha: new Date().toISOString().split('T')[0],
    saldo: '',
    metaG: '',
    metaP: '',
    operaciones: []
  });

  const [calculatorData, setCalculatorData] = useState({
    puntos: '7',
    sl: '6',
    capitalInicial: '1000',
    riesgoDiario: '2',
    numOperaciones: '3'
  });

  const [plan21Data, setPlan21Data] = useState({
    initialCapital: '150',
    dailyPercentage: '20',
  });

  useEffect(() => {
    Voice.onSpeechStart = () => setIsListening(true);
    Voice.onSpeechEnd = () => setIsListening(false);
    Voice.onSpeechResults = (e) => {
      if (e.value && e.value.length > 0 && activeInput) {
        const processedValue = processVoiceInput(e.value[0], activeInput);
        handleVoiceInput(processedValue, activeInput);
      }
    };
    Voice.onSpeechError = (e) => {
      console.log('Error de voz:', e);
      setIsListening(false);
      Alert.alert('Error', 'No se pudo procesar el reconocimiento de voz');
    };

    (async () => {
      const data = await loadData();
      if (data) {
        setTradingData(data.tradingData || tradingData);
        setCalculatorData(data.calculatorData || calculatorData);
        setPlan21Data(data.plan21Data || plan21Data);
      }
    })();

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const startVoiceRecognition = async (inputId) => {
    try {
      setActiveInput(inputId);
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: 'Permiso de micrófono',
            message: 'La app necesita acceso al micrófono para reconocimiento de voz',
            buttonPositive: 'Aceptar',
          }
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert('Permiso denegado', 'Sin permiso de micrófono no se puede usar la voz');
          return;
        }
      }
      await Voice.start('es-ES');
    } catch (error) {
      console.log('Error al iniciar reconocimiento:', error);
      Alert.alert('Error', 'No se pudo iniciar el reconocimiento de voz');
    }
  };

  const stopVoiceRecognition = async () => {
    try {
      await Voice.stop();
      setIsListening(false);
    } catch (error) {
      console.log('Error al detener reconocimiento:', error);
    }
  };

  const handleVoiceInput = (value, inputId) => {
    if (inputId.startsWith('trading.')) {
      const field = inputId.split('.')[1];
      setTradingData(prev => ({ ...prev, [field]: value }));
    } else if (inputId.startsWith('calculator.')) {
      const field = inputId.split('.')[1];
      setCalculatorData(prev => ({ ...prev, [field]: value }));
    } else if (inputId.startsWith('plan21.')) {
      const field = inputId.split('.')[1];
      setPlan21Data(prev => ({ ...prev, [field]: value }));
    } else if (inputId.startsWith('operacion.')) {
      const parts = inputId.split('.');
      const index = parseInt(parts[1]);
      const field = parts[2];
      setTradingData(prev => {
        const operaciones = [...prev.operaciones];
        if (!operaciones[index]) {
          operaciones[index] = { activo: '', resultado: '', notas: '' };
        }
        operaciones[index][field] = value;
        return { ...prev, operaciones };
      });
    }
    saveData({ tradingData, calculatorData, plan21Data });
  };

  const addOperacion = () => {
    setTradingData(prev => ({
      ...prev,
      operaciones: [...prev.operaciones, { activo: '', resultado: '', notas: '' }]
    }));
  };

  const clearData = () => {
    Alert.alert(
      'Limpiar datos',
      '¿Estás segura de que quieres eliminar todos los datos?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Limpiar',
          style: 'destructive',
          onPress: () => {
            setTradingData({
              fecha: new Date().toISOString().split('T')[0],
              saldo: '',
              metaG: '',
              metaP: '',
              operaciones: []
            });
            setCalculatorData({
              puntos: '7',
              sl: '6',
              capitalInicial: '1000',
              riesgoDiario: '2',
              numOperaciones: '3'
            });
            setPlan21Data({
              initialCapital: '150',
              dailyPercentage: '20'
            });
            saveData({});
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.logo}>
          <View style={styles.logoIcon}><Text style={styles.logoIconText}>📈</Text></View>
          <View style={styles.logoText}>
            <Text style={styles.logoTitle}>PLATAFORMA DE TRADING</Text>
            <Text style={styles.logoSubtitle}>Bitácora, Calculadora y Plan 21 días</Text>
          </View>
        </View>

        <View style={styles.navTabs}>
          <TouchableOpacity
            style={[styles.navTab, activeTab === 'trading' && styles.navTabActive]}
            onPress={() => setActiveTab('trading')}
          >
            <Text style={[styles.navTabText, activeTab === 'trading' && styles.navTabTextActive]}>
              Trading
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.navTab, activeTab === 'plan21' && styles.navTabActive]}
            onPress={() => setActiveTab('plan21')}
          >
            <Text style={[styles.navTabText, activeTab === 'plan21' && styles.navTabTextActive]}>
              Plan 21 Días
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.dateSection}>
          <Text style={styles.dateLabel}>Fecha:</Text>
          <Text style={styles.dateValue}>{tradingData.fecha}</Text>
        </View>
      </View>

      {isListening && (
        <View style={styles.voiceIndicator}>
          <Text style={styles.voiceIndicatorText}>🎤 Escuchando... Habla ahora</Text>
        </View>
      )}

      {activeTab === 'trading' ? (
        <TradingSection
          data={tradingData}
          calculatorData={calculatorData}
          onDataChange={setTradingData}
          onCalculatorChange={setCalculatorData}
          onAddOperacion={addOperacion}
          onClearData={clearData}
          onVoiceInput={handleVoiceInput}
          isListening={isListening}
          activeInput={activeInput}
          onStartVoiceRecognition={startVoiceRecognition}
          onStopVoiceRecognition={stopVoiceRecognition}
        />
      ) : (
        <Plan21Section
          data={plan21Data}
          onDataChange={setPlan21Data}
          onVoiceInput={handleVoiceInput}
          isListening={isListening}
          activeInput={activeInput}
          onStartVoiceRecognition={startVoiceRecognition}
          onStopVoiceRecognition={stopVoiceRecognition}
        />
      )}
    </View>
  );
};

export default App;