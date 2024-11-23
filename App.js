import { StyleSheet, Text, View, TouchableOpacity, Image,TextInput, Alert, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SMS from 'expo-sms';
//App para envio de SMS agrupado desenvolvido como trabalho de extensão de Valdivan Ramos
//Concluído dia 20/11/2024, às 10h53m
export default function App() {
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [endereco, setEndereco] = useState('');
  const [contatos, setContatos] = useState([]);
  const [mostrarLista, setMostrarLista] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [contatosSelecionados, setContatosSelecionados] = useState(new Set());

  useEffect(() => {
    carregarContatos();
  }, []);

  async function carregarContatos() {
    try {
      const jsonValue = await AsyncStorage.getItem('@contatos');
      const contatosSalvos = jsonValue != null ? JSON.parse(jsonValue) : [];
      setContatos(contatosSalvos);
    } catch (error) {
      Alert.alert('Desculpe!', 'Aconteceu um erro ao carregar os dados');
      console.log(error);
    }
  }

  function limparFormulario() {
    setNome('');
    setTelefone('');
    setEndereco('');
  }

  async function salvarContato(nome, telefone, endereco) {
    if (nome.trim() === '' || telefone.trim() === '' || endereco.trim() === '') {
      Alert.alert('Desculpe...', 'Você precisa preencher todos os campos antes de Salvar');
      return;
    }

    try {
      const novoContato = {
        id: Date.now().toString(),
        nome,
        telefone,
        endereco
      };

      const contatosAtualizados = [...contatos, novoContato];
      await AsyncStorage.setItem('@contatos', JSON.stringify(contatosAtualizados));
      setContatos(contatosAtualizados);
      Alert.alert('Sucesso!', 'Os Dados do Aluno foram salvos com sucesso!');
    } catch (error) {
      Alert.alert('Desculpe!', 'Aconteceu um erro ao salvar os Dados do Aluno');
      console.log(error);
    }
  }

  async function enviarSMSParaSelecionados() {
    if (contatosSelecionados.size === 0) {
      Alert.alert('Atenção!!!', 'Para enviar SMS, você deve selecionar pelo menos um Card da lista.\n \nPara selecionar um ou mais Cards:\nBasta tocar na área dele, ou \nUsar o Botão <Selecionar Todos>.');
      return;
    }

    setCarregando(true);
    try {
      const isAvailable = await SMS.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert('Atenção!!!', 'SMS não está disponível neste dispositivo');
        return;
      }

      const numerosSelecionados = contatos
        .filter(contato => contatosSelecionados.has(contato.id))
        .map(contato => contato.telefone);

      const { result } = await SMS.sendSMSAsync(
        numerosSelecionados,
        'Fundação Aleixo Belov\nNosso curso vai começar! Não perca sua aula inaugural. \nSerá dia '
      );

      if (result === 'sent') {
        Alert.alert('Sucesso!', 'Sua mensagem SMS foi enviada com sucesso!');
        setContatosSelecionados(new Set()); // Limpa a seleção após enviar
      }
    } catch (error) {
      Alert.alert('Desculpe!', 'Aconteceu um erro ao enviar SMS');
      console.log(error);
    } finally {
      setCarregando(false);
    }
  }

  function toggleSelecaoContato(id) {
    setContatosSelecionados(selecionados => {
      const novosSelecionados = new Set(selecionados);
      if (novosSelecionados.has(id)) {
        novosSelecionados.delete(id);
      } else {
        novosSelecionados.add(id);
      }
      return novosSelecionados;
    });
  }

  function selecionarTodos() {
    if (contatosSelecionados.size === contatos.length) {
      setContatosSelecionados(new Set());
    } else {
      setContatosSelecionados(new Set(contatos.map(c => c.id)));
    }
  }

  async function deletarContato(id) {
    try {
      const contatosAtualizados = contatos.filter(contato => contato.id !== id);
      await AsyncStorage.setItem('@contatos', JSON.stringify(contatosAtualizados));
      setContatos(contatosAtualizados);
      //Alert.alert('Sucesso!', 'O Card do Contato foi deletado com sucesso!');
    } catch (error) {
      Alert.alert('Desculpe!', 'Aconteceu um erro ao deletar o Card do Contato');
    }
  }

  const TelaFormulario = () => {
    const [inputNome, setInputNome] = useState('');
    const [inputTelefone, setInputTelefone] = useState('');
    const [inputEndereco, setInputEndereco] = useState('');
    const [isKeyboardVisible, setKeyboardVisible] = useState(false);

    useEffect(() => {
      const keyboardDidShowListener = Keyboard.addListener(
        'keyboardDidShow',
        () => {
          setKeyboardVisible(true);
        }
      );
      const keyboardDidHideListener = Keyboard.addListener(
        'keyboardDidHide',
        () => {
          setKeyboardVisible(false);
        }
      );

      return () => {
        keyboardDidShowListener.remove();
        keyboardDidHideListener.remove();
      };
    }, []);

    const handleSalvar = () => {
      salvarContato(inputNome, inputTelefone, inputEndereco);
      setInputNome('');
      setInputTelefone('');
      setInputEndereco('');
    };

    return (
      <View style={styles.formContainer}>
        {!isKeyboardVisible && (
          <View name="logoSuperior">
           
            <Image
            source={require("./src/assets/logo.png")} style={styles.logo} />
          </View>
        )}
        <Text style={styles.title}>Cards de Contato</Text>
        <Text style={styles.title2}>Envio Agrupado de SMS</Text>
        <TextInput 
          style={styles.input} 
          placeholder='Nome do(a) Aluno(a)'
          onChangeText={setInputNome}
          value={inputNome}
          placeholderTextColor="#999999"
        />
        
        <TextInput 
          style={styles.input} 
          placeholder='Telefone (DDD + Celular)'
          onChangeText={setInputTelefone}
          value={inputTelefone}
          keyboardType='phone-pad'
          placeholderTextColor="#999999"
        />
        
        <TextInput 
          style={styles.input} 
          placeholder='Curso Matriculado'
          onChangeText={setInputEndereco}
          value={inputEndereco}
          placeholderTextColor="#999999"
        />

        <TouchableOpacity style={styles.button} onPress={handleSalvar}>
          <Text style={styles.buttonText}>Salvar Card de Contato</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.listaButton]} 
          onPress={() => setMostrarLista(true)}
        >
          <Text style={styles.buttonText}>Ver Cards de Contatos Salvos</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const TelaLista = () => (
    <View style={styles.listContainer}>
      <Text style={styles.title} marginTop="20">Cards de Contatos Salvos</Text>
      
      {contatos.length > 0 ? (
        <>
          <View style={styles.headerButtons}>
            <TouchableOpacity 
              style={[styles.button, styles.smsButton, { flex: 1, marginRight: 5 }]} 
              onPress={enviarSMSParaSelecionados}
              disabled={carregando}
            >
              {carregando ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.buttonText}>
                  Enviar SMS ({contatosSelecionados.size})
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.button, styles.selectButton, { flex: 1, marginLeft: 5 }]} 
              onPress={selecionarTodos}
            >
              <Text style={styles.buttonText}>
                {contatosSelecionados.size === contatos.length ? 
                  'Desmarcar Todos' : 'Selecionar Todos'}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollView}>
            {contatos.map(contato => (
              <TouchableOpacity 
                key={contato.id} 
                style={[
                  styles.contatoCard,
                  contatosSelecionados.has(contato.id) && styles.contatoSelecionado
                ]}
                onPress={() => toggleSelecaoContato(contato.id)}
              >
                <View style={styles.contatoInfo}>
                  <Text style={styles.contatoNome}>{contato.nome}</Text>
                  <Text style={styles.contatoDetalhe}>{contato.telefone}</Text>
                  <Text style={styles.contatoDetalhe}>{contato.endereco}</Text>
                </View>
                <TouchableOpacity 
                  style={styles.deleteButton}
                  onPress={(e) => {
                    e.stopPropagation();
                    deletarContato(contato.id);
                  }}
                >
                  <Text style={styles.deleteButtonText}>Deletar</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </>
      ) : (
        <Text style={styles.emptyText}>Nenhum Card de Contato Cadastrado</Text>
        
      )}
      
      <TouchableOpacity
        style={[styles.button, styles.voltarButton]} 
        onPress={() => {
          setMostrarLista(false);
          setContatosSelecionados(new Set());
        }}
      >
        <Text style={styles.buttonText}>Voltar à Tela Inicial</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {mostrarLista ? (
        <TelaLista />
      ) : (
        <>
          <TelaFormulario />
          <View style={styles.footer}>
            <Text style={styles.footerText}>Projeto de Extensão by Valdivan Ramos</Text>
          </View>
        </>
      )}
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  formContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f5f5f5',
  },
  listContainer: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 0,
    color: '#333',
  },
  title2: {
    fontSize: 14,
    fontWeight: 'normal',
    marginBottom: 10,
    color: '#0033aa',
  },
  input: {
    width: '90%',
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    color: '#000',
  },
  button: {
    width: '80%',
    height: 60,
    backgroundColor: '#0033cc',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  listaButton: {
    backgroundColor: '#000099',
  },
  smsButton: {
    backgroundColor: '#0033cc',
  },
  voltarButton: {
    backgroundColor: 'green',
    width:200,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
    marginTop: 5,
    marginBottom: 20,
  },
  contatoCard: {
    backgroundColor: '#efefef',
    padding: 1,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  contatoInfo: {
    flex: 1,
  },
  contatoNome: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  contatoDetalhe: {
    fontSize: 16,
    color: '#666',
    marginTop: 1,
  },
  deleteButton: {
    backgroundColor: '#cc0000',
    padding: 10,
    borderRadius: 20,
    marginRight: 1,
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: 'normal',
    marginLeft: 5,
    marginRight: 5,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginVertical: 20,
  },
  headerButtons: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  selectButton: {
    backgroundColor: '#0033cc',
  },
  contatoSelecionado: {
    backgroundColor: '#E3F2FD',
    borderColor: '#2196F3',
    borderWidth: 2,
  },
  footer: {
    width: '100%',
    padding: 5,
    backgroundColor: '#99ff99',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingRight: 20,
  },
  footerText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: 'italic',
  },
  logo: {
    width: 130,
    height: 150,
    marginBottom:0,
  },
});