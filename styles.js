import React, { Component, PropTypes } from 'react';
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: 'blue',
      alignItems: 'flex-start',
      justifyContent: 'center',
    },
    listRow: {
      flexDirection:'row'
    },
    formGroup: {
      margin: 20
    },
    inputStyle: {
      backgroundColor: 'white',
      width: 300,
      height:24,
    },
    label: {
      color: 'white'
    },
    submitButton: {
      backgroundColor: "green",
      padding: 11,
      margin: 16,
      height: 42,
      width: 120,
      alignItems: 'center'
    },
    submitButtonText: {
      color: "white"
    }
  });

export default styles;