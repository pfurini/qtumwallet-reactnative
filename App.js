/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React from 'react';
import type {Node} from 'react';
import {
  Button,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  useColorScheme,
  View,
} from 'react-native';

import {Colors} from 'react-native/Libraries/NewAppScreen';
import {networks, generateMnemonic} from 'qtumjs-wallet';
import QtumRPC from 'qtumjs-wallet/lib/qtumRPC';

const network = networks.regtest;
const acct1WifPrivateKey =
  'cMbgxCJrTYUqgcmiC1berh5DFrtY1KeU4PXZ6NZxgenniF1mXCRk';

async function generateBlock() {
  const rpcClient = new QtumRPC({
    user: 'qtum',
    pass: 'test',
    port: '18332',
    protocol: 'http',
    host: '10.0.2.2',
  });
  await rpcClient.generate(1);
}

const Section = ({children, title}): Node => {
  const isDarkMode = useColorScheme() === 'dark';
  return (
    <View style={styles.sectionContainer}>
      <Text
        style={[
          styles.sectionTitle,
          {
            color: isDarkMode ? Colors.white : Colors.black,
          },
        ]}>
        {title}
      </Text>
      <Text
        style={[
          styles.sectionDescription,
          {
            color: isDarkMode ? Colors.light : Colors.dark,
          },
        ]}>
        {children}
      </Text>
    </View>
  );
};

const MnemonicGenerator = () => {
  const [mnemonic, setMnemonic] = React.useState(null);

  function onGenerateClick() {
    setMnemonic(generateMnemonic());
  }

  return (
    <View style={styles.sectionContainer}>
      <Button onPress={onGenerateClick} title="Generate" />
      <TextInput value={mnemonic} multiline numberOfLines={3} />
    </View>
  );
};

const WalletGenerator = () => {
  const [mnemonic, setMnemonic] = React.useState(null);
  const [password, setPassword] = React.useState(null);
  const [wallet, setWallet] = React.useState(null);

  function onCreateClick() {
    setWallet(network.fromMnemonic(mnemonic, password));
  }

  return (
    <View style={styles.sectionContainer}>
      <TextInput
        placeholder="Enter Mnemonic"
        value={mnemonic}
        onChange={setMnemonic}
      />
      <TextInput
        placeholder="Enter Password"
        value={password}
        onChange={setPassword}
      />
      <Button onPress={onCreateClick} title="Create" />
      <View style={{paddingTop: 24}}>
        <Text style={styles.highlight}>Public address: </Text>
        <Text>{wallet && wallet.address}</Text>
        <Text style={styles.highlight}>Private key (WIF): </Text>
        <Text>{wallet && wallet.toWIF()}</Text>
      </View>
    </View>
  );
};

const ContractCreator = ({onContractCreated}) => {
  const [working, setWorking] = React.useState(false);
  const [error, setError] = React.useState('');
  const [contractAddress, setContractAddress] = React.useState(null);
  const wallet = network.fromWIF(acct1WifPrivateKey);
  const code =
    '608060405234801561001057600080fd5b506040516020806101a08339810180604052810190808051906020019092919050505080600081905550506101568061004a6000396000f30060806040526004361061004c576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff16806360fe47b1146100515780636d4ce63c1461007e575b600080fd5b34801561005d57600080fd5b5061007c600480360381019080803590602001909291905050506100a9565b005b34801561008a57600080fd5b50610093610121565b6040518082815260200191505060405180910390f35b807f61ec51fdd1350b55fc6e153e60509e993f8dcb537fe4318c45a573243d96cab433600054604051808373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020018281526020019250505060405180910390a28060008190555050565b600080549050905600a165627a7a7230582046690add90673a282f8c66726ec3e7803a56ddb8c9b7ec6a844b0b447c005d8b00290000000000000000000000000000000000000000000000000000000000000064';

  async function onCreateClick() {
    try {
      setWorking(true);
      const tx = await wallet.contractCreate(code);
      const txId = tx.txid;
      await generateBlock(network);
      const insight = network.insight();
      const info = await insight.getTransactionInfo(txId);
      const _contractAddress = info.receipt[0].contractAddress;
      setContractAddress(_contractAddress);
      onContractCreated(_contractAddress);
      setError('');
    } catch (e) {
      setError('ERROR: ' + e.message);
    } finally {
      setWorking(false);
    }
  }

  return (
    <View style={styles.sectionContainer}>
      <Button
        onPress={onCreateClick}
        title="Create Contract"
        disabled={working || (contractAddress != null)}
      />
      <Text>{error}</Text>
      <View style={{paddingTop: 24}}>
        <Text style={styles.highlight}>Contract address: </Text>
        <Text>{contractAddress}</Text>
      </View>
    </View>
  );
};

const ContractCall = ({contractAddress}) => {
  const [working, setWorking] = React.useState(false);
  const [error, setError] = React.useState('');
  const [executionResult, setExecutionResult] = React.useState(null);
  const encodedData = '6d4ce63c';
  const wallet = network.fromWIF(acct1WifPrivateKey);

  async function onCallClick() {
    try {
      setWorking(true);
      const result = await wallet.contractCall(contractAddress, encodedData);
      setExecutionResult(result.executionResult);
      setError('');
    } catch (e) {
      setError('ERROR: ' + e.message);
    } finally {
      setWorking(false);
    }
  }

  return (
    <View style={styles.sectionContainer}>
      <Button
        onPress={onCallClick}
        title="Call Contract"
        disabled={working || contractAddress == null || executionResult != null}
      />
      <Text>{error}</Text>
      <View style={{paddingTop: 24}}>
        <Text style={styles.highlight}>Execution result: </Text>
        <Text>{JSON.stringify(executionResult)}</Text>
      </View>
    </View>
  );
};

const ContractSend = ({contractAddress}) => {
  const [working, setWorking] = React.useState(false);
  const [error, setError] = React.useState('');
  const [executionResult, setExecutionResult] = React.useState(null);
  const encodedData =
    '60fe47b10000000000000000000000000000000000000000000000000000000000000001';
  const wallet = network.fromWIF(acct1WifPrivateKey);

  async function onSendClick() {
    try {
      setWorking(true);
      await wallet.contractSend(contractAddress, encodedData);
      await generateBlock(network);
      const result = await wallet.contractCall(contractAddress, '6d4ce63c');
      setExecutionResult(result.executionResult);
      setError('');
    } catch (e) {
      setError('ERROR: ' + e.message);
    } finally {
      setWorking(false);
    }
  }

  return (
    <View style={styles.sectionContainer}>
      <Button
        onPress={onSendClick}
        title="Send to Contract"
        disabled={working || contractAddress == null || executionResult != null}
      />
      <Text>{error}</Text>
      <View style={{paddingTop: 24}}>
        <Text style={styles.highlight}>Execution result: </Text>
        <Text>{JSON.stringify(executionResult)}</Text>
      </View>
    </View>
  );
};

const App: () => Node = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const [contractAddress, setContractAddress] = React.useState(null);

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={backgroundStyle}>
        <View
          style={{
            backgroundColor: isDarkMode ? Colors.black : Colors.white,
          }}>
          <Section title="Mnemonic Generation">
            Click on <Text style={styles.highlight}>Generate</Text> to create a
            new mnemonic.
          </Section>
          <MnemonicGenerator />
          <Section title="Create Wallet from Mnemonic">
            Paste the mnemonic and enter a password, then click{' '}
            <Text style={styles.highlight}>Create</Text> to create a new wallet.
          </Section>
          <WalletGenerator />
          <Section title="Create a Contract by Test Account 1">
            Click <Text style={styles.highlight}>Create Contract</Text> to{' '}
            create a test contract from the wallet{' '}
            <Text>qUbxboqjBRp96j3La8D1RYkyqx5uQbJPoW</Text>
          </Section>
          <ContractCreator onContractCreated={setContractAddress} />
          <Section title="Invoke contractCall ">
            Click <Text style={styles.highlight}>Call Contract</Text> to call
            previously created contract with data "6d4ce63c".
          </Section>
          <ContractCall contractAddress={contractAddress} />
          <Section title="Invoke contractSend ">
            Click <Text style={styles.highlight}>Send to Contract</Text> to send
            data to previously created contract.
          </Section>
          <ContractSend contractAddress={contractAddress} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

export default App;
