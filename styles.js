import React, { Component, PropTypes } from 'react';
import { StyleSheet } from 'react-native';

const pageBackground = 'white';
const pageForeground = '#2c2c2c'
const borderColor = 'darkgray';

const accentColor = '#d19b3d';
const primaryColor = 'rgb(25,118,210)';

const styles = StyleSheet.create({

  container: {
      flex: 1,
      padding:20,
      alignItems: 'flex-start',
    },

    scrollContainer: {
      padding:20,
      flex:1,
    },

    listRow: {
      flexDirection:'row'
    },

    formGroup: {
      margin: 20
    },

    inputStyle: {
      backgroundColor: pageBackground,
      width: 300,
      height:40,
      borderColor: borderColor,
      borderWidth:1,
      padding:4,
      borderRadius:8,
      marginBottom:10,
      fontSize:18
    },

    label: {
      color: pageForeground,
      fontSize:18,
    },

    spinner: {
      size:"large",
      color:accentColor
    },  

    spinnerView: {
      position: "absolute",
      zIndex: 1,
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: pageBackground,
    },

    centeredContent: {
      position: "absolute",
      zIndex: 1,
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#F5FCFF88",
    },
    
    submitButton: {
      backgroundColor: primaryColor,
      padding: 11,
      borderRadius:10,
      margin: 0,
      height: 42,
      width: 300,
      alignItems: 'center'
    },

    navRow: {
      backgroundColor: "white",
      height:42,
      width: 300,
      borderBottomColor: borderColor,
      borderBottomWidth: 1
    },

    navRowText: {
      color: pageForeground
    },

    submitButtonText: {
      color: "white"
    },

    btnCircle: {
      width: 60,
      height: 60,
      borderRadius: 30,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'white',
      shadowColor: "#000",
      shadowOffset: {
      width: 0,
      height: 1,
      },
      shadowOpacity: 0.20,
      shadowRadius: 1.41,
      elevation: 1,
      bottom: 28
  },

  btnCircleUp: {
      width: 60,
      height: 60,
      borderRadius: 30,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#E8E8E8',
      bottom: 18,
      shadowColor: "#000",
      shadowOffset: {
      width: 0,
      height: 1,
      },
      shadowOpacity: 0.20,
      shadowRadius: 1.41,
      elevation: 1,
  },

  imgCircle: {
      width: 30,
      height: 30,
      tintColor: '#48CEF6'
  },

  img: {
      width: 30,
      height: 30,
  },

  item: {
    padding: 20,
    marginTop: 5,
    fontSize: 15,
  },

  loadingIndicator: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center'
  }

  });

export default styles;