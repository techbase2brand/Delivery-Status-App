// import React, { useRef, useEffect, useState } from 'react';
// import { View, Button, Text, Image, StyleSheet, Dimensions, Platform, ActivityIndicator, Alert, ScrollView, Linking } from 'react-native';
// import SignatureCapture from 'react-native-signature-canvas';
// import Geolocation from 'react-native-geolocation-service';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { request, PERMISSIONS } from 'react-native-permissions';
// import { useNavigation, useRoute } from '@react-navigation/native';
// import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
// import { TextInput } from 'react-native-gesture-handler';

// const DeliveryConfirmationScreen = () => {
//     const ref = useRef(null);
//     const route = useRoute();
//     const { order } = route.params; // Extract order info
//     const [savedLocation, setSavedLocation] = useState(null);
//     const [savedSignature, setSavedSignature] = useState(null);
//     const [address, setAddress] = useState();
//     const [loading, setLoading] = useState(false);
//     const [isPenApplied, setIsPenApplied] = useState(false);
//     const [images, setImages] = useState([]); // Store captured images
//     const screenWidth = Dimensions.get('window').width;
//     const signatureWidth = screenWidth;
//     const navigation = useNavigation();
//     const [customerName, setCustomerName] = useState('');

//     const handleOK = async (signature) => {
//         await saveSignature(signature);
//     };

//     const handleClear = () => {
//         ref.current.clearSignature();
//         setIsPenApplied(false);
//     };

//     const handleBegin = () => {
//         setIsPenApplied(true);
//     };

//     const handleConfirm = async () => {
//         if (images.length < 1) {
//             Alert.alert("Please capture at least one image.");
//             return;
//         }
//         setLoading(true);
//         ref.current.readSignature();
//         getLocation();
//         const confirmedOrders = JSON.parse(await AsyncStorage.getItem('confirmedOrders')) || [];
//         confirmedOrders.push(order.id);
//         await AsyncStorage.setItem('confirmedOrders', JSON.stringify(confirmedOrders));
//         setLoading(false);
//         // sendEmail()
//         // navigation.navigate("OrderStatus");
//     };

//     const requestLocationPermission = async () => {
//         try {
//             const result = await request(
//                 Platform.OS === 'ios'
//                     ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
//                     : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION
//             );
//             if (result !== 'granted') {
//                 console.log('Location permission denied');
//             }
//         } catch (error) {
//             console.warn(error);
//         }
//     };

//     const saveSignature = async (signature) => {
//         try {
//             await AsyncStorage.setItem(`signature_${order.id}`, signature);
//             setSavedSignature(signature);
//         } catch (e) {
//             console.error('Failed to save signature', e);
//         }
//     };



//     const saveLocation = async (location) => {
//         try {
//             await AsyncStorage.setItem(`location_${order.id}`, JSON.stringify(location));
//             setSavedLocation(location);
//             fetchAddress(location.coords.latitude, location.coords.longitude);
//         } catch (e) {
//             console.error('Failed to save location', e);
//         }
//     };

//     const saveAddress = async (address) => {
//         try {
//             await AsyncStorage.setItem(`address_${order.id}`, address);
//             setAddress(address);
//         } catch (e) {
//             console.error('Failed to save address', e);
//         }
//     };

//     const getLocation = () => {
//         Geolocation.getCurrentPosition(
//             (position) => saveLocation(position),
//             (error) => console.error('Error getting location', error),
//             {
//                 enableHighAccuracy: true,
//                 timeout: 15000,
//                 maximumAge: 10000,
//                 distanceFilter: 0,
//                 forceRequestLocation: true,
//             }
//         );
//     };

//     const fetchAddress = async (latitude, longitude) => {
//         try {
//             const response = await fetch(
//                 `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=AIzaSyBXNyT9zcGdvhAUCUEYTm6e_qPw26AOPgI`
//             );
//             const data = await response.json();
//             if (data.status === 'OK') {
//                 const fetchedAddress = data.results[0].formatted_address;
//                 saveAddress(fetchedAddress);
//             } else {
//                 console.error('Failed to fetch address:', data.status);
//             }
//         } catch (error) {
//             console.error('Error fetching address:', error);
//         }
//     };

//     useEffect(() => {
//         requestLocationPermission();
//         displaySavedData();
//     }, []);

//     const displaySavedData = async () => {
//         try {
//             const signature = await AsyncStorage.getItem(`signature_${order.id}`);
//             if (signature) {
//                 setSavedSignature(signature);
//             }

//             const location = await AsyncStorage.getItem(`location_${order.id}`);
//             if (location) {
//                 const parsedLocation = JSON.parse(location);
//                 setSavedLocation(parsedLocation);
//                 fetchAddress(parsedLocation.coords.latitude, parsedLocation.coords.longitude);
//             }

//             const savedAddress = await AsyncStorage.getItem(`address_${order.id}`);
//             if (savedAddress) {
//                 setAddress(savedAddress);
//             }

//             const storedImages = JSON.parse(await AsyncStorage.getItem(`images_${order.id}`)) || [];
//             setImages(storedImages);

//         } catch (e) {
//             console.error('Failed to retrieve saved data', e);
//         }
//     };

//     const captureImage = async () => {
//         if (images.length >= 5) {
//             Alert.alert("Maximum of 5 images can be captured.");
//             return;
//         }

//         const options = {
//             mediaType: 'photo',
//             includeBase64: true,
//             saveToPhotos: true,
//         };

//         launchCamera(options, async (response) => {
//             if (response.didCancel) {
//                 console.log('User cancelled image picker');
//             } else if (response.error) {
//                 console.error('ImagePicker Error: ', response.error);
//             } else if (response.assets) {
//                 const newImage = response.assets[0];
//                 const updatedImages = [...images, newImage.uri];
//                 setImages(updatedImages);
//                 await AsyncStorage.setItem(`images_${order.id}`, JSON.stringify(updatedImages));
//             }
//         });
//     };

//     return (
//         <ScrollView contentContainerStyle={styles.scrollContainer}>
//             <View style={styles.container}>
//                 <View style={styles.stepContainer}>
//                     <TextInput
//                         style={styles.input}
//                         placeholder="Enter Customer Name"
//                         value={customerName}
//                         onChangeText={setCustomerName}
//                     />
//                 </View>
//                 <SignatureCapture
//                     ref={ref}
//                     onOK={handleOK}
//                     onBegin={handleBegin}
//                     descriptionText="Sign to confirm"
//                     clearText="Clear"
//                     confirmText="Confirm"
//                     webStyle={`.m-signature-pad--footer { display: none; margin: 0; padding: 0;}
//                             .m-signature-pad { margin: 0px; width: ${signatureWidth}px;}`}
//                 />
//                 {loading && <ActivityIndicator size="large" color="#0000ff" />}
//                 {savedSignature && (
//                     <View style={styles.signatureContainer}>
//                         <Text style={styles.signatureText}>Saved Signature:</Text>
//                         <Image
//                             source={{ uri: savedSignature }}
//                             style={styles.signatureImage}
//                         />
//                     </View>
//                 )}
//                 {savedLocation && (
//                     <View style={styles.locationContainer}>
//                         {address && <Text style={styles.locationText}>Address: {address}</Text>}
//                     </View>
//                 )}
//                 <View style={styles.imagesContainer}>
//                     {images.map((imageUri, index) => (
//                         <Image key={index} source={{ uri: imageUri }} style={styles.capturedImage} />
//                     ))}
//                 </View>
//                 <View style={styles.buttonContainer}>
//                     <Button title="Capture Image" onPress={captureImage} />
//                     <View style={styles.spacer} />
//                     <Button title="Clear" onPress={handleClear} />
//                     <View style={styles.spacer} />
//                     <Button title="Confirm" onPress={handleConfirm} disabled={!isPenApplied || images.length < 1} />
//                 </View>
//             </View>
//         </ScrollView>
//     );
// };

// const styles = StyleSheet.create({
//     scrollContainer: {
//         flexGrow: 1,
//     },
//     container: {
//         flex: 1,
//         padding: 20,
//         backgroundColor: '#f7f7f7',
//     },
//     signatureCanvas: {
//         width: '100%',
//         height: 200,
//     },
//     locationContainer: {
//         marginTop: 10,
//     },
//     locationText: {
//         fontSize: 16,
//         color: '#333',
//         marginVertical: 4,
//     },
//     signatureContainer: {
//         marginTop: 10,
//         alignItems: 'center',
//     },
//     signatureText: {
//         fontSize: 18,
//         color: '#333',
//         marginBottom: 10,
//     },
//     signatureImage: {
//         width: '100%',
//         height: 100,
//         resizeMode: 'contain',
//         borderColor: '#000',
//         borderWidth: 1,
//     },
//     imagesContainer: {
//         flexDirection: 'row',
//         flexWrap: 'wrap',
//         justifyContent: 'space-around',
//         marginTop: 10,
//     },
//     capturedImage: {
//         width: 95,
//         height: 95,
//         resizeMode: 'cover',
//         marginBottom: 10,
//         borderRadius: 8,
//         borderWidth: 1,
//         borderColor: '#ccc',
//     },
//     buttonContainer: {
//         flexDirection: 'row',
//         justifyContent: 'center',
//         marginTop: 30,
//     },
//     spacer: {
//         width: 20,
//     },
//     stepContainer: {
//         marginBottom: 20,
//     },
//     stepTitle: {
//         fontSize: 18,
//         fontWeight: 'bold',
//         marginBottom: 10,
//     },
//     input: {
//         borderWidth: 1,
//         borderColor: '#ccc',
//         borderRadius: 5,
//         padding: 10,
//         marginBottom: 10,
//     }
// });

// export default DeliveryConfirmationScreen;



import React, { useRef, useEffect, useState } from 'react';
import { View, Button, Text, Image, StyleSheet, Dimensions, Platform, ActivityIndicator, Alert, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import SignatureCapture from 'react-native-signature-canvas';
import Geolocation from 'react-native-geolocation-service';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { request, PERMISSIONS } from 'react-native-permissions';
import { useNavigation, useRoute } from '@react-navigation/native';
import { launchCamera } from 'react-native-image-picker';

const DeliveryConfirmationScreen = () => {
    const ref = useRef(null);
    const route = useRoute();
    const { order } = route.params;
    const [savedLocation, setSavedLocation] = useState(null);
    const [savedSignature, setSavedSignature] = useState(null);
    const [address, setAddress] = useState();
    const [loading, setLoading] = useState(false);
    const [isPenApplied, setIsPenApplied] = useState(false);
    const [images, setImages] = useState([]);
    const [step, setStep] = useState(1);
    const [customerName, setCustomerName] = useState('');
    const screenWidth = Dimensions.get('window').width;
    const signatureWidth = screenWidth;
    const navigation = useNavigation();

    const handleOK = async (signature) => {
        await saveSignature(signature);
        setStep(4);
    };
    const handleClear = () => {
        ref.current.clearSignature();
        setIsPenApplied(false);
    };

    const handleBegin = () => {
        setIsPenApplied(true);
    };

    const handleConfirm = async () => {
        if (step === 1) {
            if (customerName.trim() === '') {
                Alert.alert("Please enter the customer name.");
                return;
            }
            await saveCustomerName(customerName);
            getLocation();
            setStep(2);
        } else if (step === 2) {
            setStep(3);
        } else if (step === 3) {
            setStep(4);
        } else if (step == 4) {
            setLoading(true);
            const confirmedOrders = JSON.parse(await AsyncStorage.getItem('confirmedOrders')) || [];
            confirmedOrders.push(order.id);
            await AsyncStorage.setItem('confirmedOrders', JSON.stringify(confirmedOrders));
            setLoading(false);
            displaySavedData();
            navigation.navigate("OrderStatus")
        }
    };

    const requestLocationPermission = async () => {
        try {
            const result = await request(
                Platform.OS === 'ios'
                    ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
                    : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION
            );
            if (result !== 'granted') {
                console.log('Location permission denied');
            }
        } catch (error) {
            console.warn(error);
        }
    };

    const saveSignature = async (signature) => {
        try {
            await AsyncStorage.setItem(`signature_${order.id}`, signature);
            setSavedSignature(signature);
        } catch (e) {
            console.error('Failed to save signature', e);
        }
    };

    const saveLocation = async (location) => {
        try {
            await AsyncStorage.setItem(`location_${order.id}`, JSON.stringify(location));
            setSavedLocation(location);
            fetchAddress(location.coords.latitude, location.coords.longitude);
        } catch (e) {
            console.error('Failed to save location', e);
        }
    };

    const saveAddress = async (address) => {
        try {
            await AsyncStorage.setItem(`address_${order.id}`, address);
            setAddress(address);
        } catch (e) {
            console.error('Failed to save address', e);
        }
    };

    const saveCustomerName = async (name) => {
        try {
            await AsyncStorage.setItem(`customerName_${order.id}`, name);
        } catch (e) {
            console.error('Failed to save customer name', e);
        }
    };

    const getLocation = () => {
        Geolocation.getCurrentPosition(
            (position) => saveLocation(position),
            (error) => console.error('Error getting location', error),
            {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 10000,
                distanceFilter: 0,
                forceRequestLocation: true,
            }
        );
    };

    const fetchAddress = async (latitude, longitude) => {
        try {
            const response = await fetch(
                `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=AIzaSyBXNyT9zcGdvhAUCUEYTm6e_qPw26AOPgI`
            );
            const data = await response.json();
            if (data.status === 'OK') {
                const fetchedAddress = data.results[0].formatted_address;
                saveAddress(fetchedAddress);
            } else {
                console.error('Failed to fetch address:', data.status);
            }
        } catch (error) {
            console.error('Error fetching address:', error);
        }
    };

    useEffect(() => {
        requestLocationPermission();
        displaySavedData()
    }, []);

    const displaySavedData = async () => {
        try {
            const signature = await AsyncStorage.getItem(`signature_${order.id}`);
            if (signature) {
                setSavedSignature(signature);
            }

            const location = await AsyncStorage.getItem(`location_${order.id}`);
            if (location) {
                const parsedLocation = JSON.parse(location);
                setSavedLocation(parsedLocation);
                fetchAddress(parsedLocation.coords.latitude, parsedLocation.coords.longitude);
            }

            const savedAddress = await AsyncStorage.getItem(`address_${order.id}`);
            if (savedAddress) {
                setAddress(savedAddress);
            }

            const savedCustomerName = await AsyncStorage.getItem(`customerName_${order.id}`);
            if (savedCustomerName) {
                setCustomerName(savedCustomerName);
            }

            const storedImages = JSON.parse(await AsyncStorage.getItem(`images_${order.id}`)) || [];
            setImages(storedImages);

        } catch (e) {
            console.error('Failed to retrieve saved data', e);
        }
    };

    const captureImage = async () => {
        if (images.length >= 5) {
            Alert.alert("Maximum of 5 images can be captured.");
            return;
        }

        const options = {
            mediaType: 'photo',
            includeBase64: true,
            saveToPhotos: true,
        };

        launchCamera(options, async (response) => {
            if (response.didCancel) {
                console.log('User cancelled image picker');
            } else if (response.error) {
                console.error('ImagePicker Error: ', response.error);
            } else if (response.assets) {
                const newImage = response.assets[0];
                const updatedImages = [...images, newImage.uri];
                setImages(updatedImages);
                await AsyncStorage.setItem(`images_${order.id}`, JSON.stringify(updatedImages));
            }
        });
    };

    return (
        //         <ScrollView contentContainerStyle={styles.scrollContainer}>
        //             <View style={styles.container}>
        //                 {step === 1 && (
        //                     <View style={styles.stepContainer}>
        //                         <TextInput
        //                             style={styles.input}
        //                             placeholder="Enter Customer Name"
        //                             value={customerName}
        //                             onChangeText={setCustomerName}
        //                         />
        //                         <Button title="Next" onPress={handleConfirm} />
        //                     </View>
        //                 )}
        //                 {step === 2 && (
        //                     <View style={styles.stepContainer}>
        //                         <View style={styles.imagesContainer}>
        //                             {images.map((imageUri, index) => (
        //                                 <Image key={index} source={{ uri: imageUri }} style={styles.capturedImage} />
        //                             ))}
        //                         </View>
        //                         <View style={styles.buttonContainer}>
        //                             <Button title="Capture Image" onPress={captureImage} />
        //                             <View style={styles.spacer} />
        //                             <Button title="Next" onPress={handleConfirm} disabled={images.length < 1} />
        //                         </View>
        //                     </View>
        //                 )}
        //                 {step === 3 && (
        //                     <View style={styles.stepContainer}>
        //                         <SignatureCapture
        //                             ref={ref}
        //                             onOK={handleOK}
        //                             onBegin={handleBegin}
        //                             descriptionText="Sign to confirm"
        //                             clearText="Clear"
        //                             confirmText="Confirm"
        //                             webStyle={`.m-signature-pad--footer { display: none; margin: 0; padding: 0;}
        //                             .m-signature-pad { margin: 0px; width: ${signatureWidth}px;}`}
        //                         />
        //                         {loading && <ActivityIndicator size="large" color="#0000ff" />}
        //                         <View style={styles.buttonContainer}>
        //                             <Button title="Clear" onPress={handleClear} />
        //                             <View style={styles.spacer} />
        //                             {/* <Button title="Next" onPress={() => { ref.current.readSignature(); handleOK }} disabled={!isPenApplied} /> */}
        //                             <Button title="Next" onPress={handleOK} disabled={!isPenApplied} />
        //                         </View>
        //                     </View>
        //                 )}
        //                 {step === 4 && (
        //                     <View style={styles.stepContainer}>
        //                         <Text>Customer Name: {customerName}</Text>
        //                         {address && (
        //                             <View style={styles.addressContainer}>
        //                                 <Text>Address:</Text>
        //                                 <Text>{address}</Text>
        //                             </View>
        //                         )}
        //                         {images && <View style={styles.imagesContainer}>
        //                             {images.map((imageUri, index) => (
        //                                 <Image key={index} source={{ uri: imageUri }} style={styles.capturedImage} />
        //                             ))}
        //                         </View>}
        //                         {savedSignature && (
        //                             <View style={styles.signatureContainer}>
        //                                 <Text>Signature:</Text>
        //                                 <Image
        //                                     source={{ uri: savedSignature }}
        //                                     style={styles.signatureImage}
        //                                 />
        //                             </View>
        //                         )}
        //                         <Button title="Confirmed" onPress={handleConfirm} />
        //                     </View>
        //                 )}
        //             </View>
        //         </ScrollView>
        //     );
        // };

        // const styles = StyleSheet.create({
        //     container: {
        //         flex: 1,
        //         padding: 16,
        //     },
        //     stepContainer: {
        //         flex: 1
        //     },
        //     input: {
        //         height: 40,
        //         borderColor: 'gray',
        //         borderWidth: 1,
        //         marginBottom: 10,
        //         paddingHorizontal: 8,
        //     },
        //     imagesContainer: {
        //         flexDirection: 'row',
        //         flexWrap: 'wrap',
        //     },
        //     capturedImage: {
        //         width: 100,
        //         height: 100,
        //         margin: 5,
        //     },
        //     locationContainer: {
        //         marginBottom: 10,
        //     },
        //     addressContainer: {
        //         marginBottom: 10,
        //     },
        //     signatureContainer: {
        //         marginBottom: 10,
        //     },
        //     signatureImage: {
        //         width: 300,
        //         height: 200,
        //         borderColor: '#000',
        //         borderWidth: 1,
        //     },
        //     scrollContainer: {
        //         flexGrow: 1,
        //     },
        //     buttonContainer: {
        //         flexDirection: 'row',
        //         justifyContent: 'center',
        //         marginTop: 30,
        //     },
        //     spacer: {
        //         width: 20,
        //     },
        // });

        // export default DeliveryConfirmationScreen;
        <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.container}>
                {step === 1 && (
                    <View style={styles.stepContainer}>
                        <Text style={styles.title}>Step 1: Enter Customer Name</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter Customer Name"
                            value={customerName}
                            onChangeText={setCustomerName}
                        />
                        <TouchableOpacity style={styles.button} onPress={handleConfirm}>
                            <Text style={styles.buttonText}>Next</Text>
                        </TouchableOpacity>
                    </View>
                )}
                {/* {step === 2 && (
                    <View style={styles.stepContainer}>
                        <Text style={styles.title}>Step 2: Capture Images</Text>
                        <View style={styles.imagesContainer}>
                            {images.map((imageUri, index) => (
                                <Image key={index} source={{ uri: imageUri }} style={styles.capturedImage} />
                            ))}
                        </View>
                        <TouchableOpacity style={styles.button} onPress={captureImage}>
                            <Text style={styles.buttonText}>Capture Image</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[images.length < 1 ? styles.disableButton : styles.button, { marginTop: 10 }]} onPress={handleConfirm} disabled={images.length < 1}>
                            <Text style={[styles.buttonText, images.length < 1 ? { color: "#737272" } : { color: "white" }]}>Next</Text>
                        </TouchableOpacity>
                    </View>
                )} */}
                {step === 2 && (
                    <View style={styles.stepContainer}>
                        <Text style={styles.title}>Step 2: Capture Images</Text>
                        <View style={styles.imagesContainer}>
                            {Array.from({ length: 5 }).map((_, index) => (
                                <View key={index} style={styles.imageBox}>
                                    {images[index] ? (
                                        <Image source={{ uri: images[index] }} style={styles.capturedImage} />
                                    ) : (
                                        <View style={styles.placeholder}>
                                            <Text style={styles.placeholderText}>Image {index + 1}</Text>
                                        </View>
                                    )}
                                </View>
                            ))}
                        </View>
                        <TouchableOpacity style={styles.button} onPress={captureImage}>
                            <Text style={styles.buttonText}>Capture Image</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[images.length < 1 ? styles.disableButton : styles.button, { marginTop: 10 }]}
                            onPress={handleConfirm}
                            disabled={images.length < 1}
                        >
                            <Text style={[styles.buttonText, images.length < 1 ? { color: '#737272' } : { color: 'white' }]}>Next</Text>
                        </TouchableOpacity>
                    </View>
                )}
                {step === 3 && (
                    <View style={styles.stepContainer}>
                        <Text style={styles.title}>Step 3: Capture Signature</Text>
                        <SignatureCapture
                            ref={ref}
                            onOK={handleOK}
                            onBegin={handleBegin}
                            descriptionText="Sign to confirm"
                            clearText="Clear"
                            confirmText="Confirm"
                            webStyle={`.m-signature-pad--footer { display: none; margin: 0; padding: 0;}
                                       .m-signature-pad { margin: 0px; width: ${signatureWidth}px;}`}
                        />
                        {loading && <ActivityIndicator size="large" color="#0000ff" />}
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity style={styles.button} onPress={handleClear}>
                                <Text style={styles.buttonText}>Clear Signature</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={!isPenApplied ? styles.disableButton : styles.button}
                                // onPress={() => { handleOK }}
                                onPress={() => { ref.current.readSignature(); handleOK }}
                                disabled={!isPenApplied}>
                                <Text style={[styles.buttonText, !isPenApplied ? { color: "#737272" } : { color: "white" }]}>Next</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
                {step === 4 && (
                    <View style={styles.stepContainer}>
                        <Text style={styles.title}>Step 4: Review & Confirm</Text>
                        <View style={{ flexDirection: "row", alignItems: "baseline" }}>
                            <Text style={styles.title}>Customer Name: </Text>
                            <Text style={styles.text}>{customerName}</Text>
                        </View>
                        {address && (
                            <View style={styles.addressContainer}>
                                <Text style={styles.title}>Customer Address:</Text>
                                <Text style={styles.text}>{address}</Text>
                            </View>
                        )}
                        {images.length > 0 && (
                            <>
                                <Text style={styles.title}>Customer Images:</Text>
                                <View style={styles.imagesContainer}>
                                    {Array.from({ length: 5 }).map((_, index) => (
                                        <View key={index} style={styles.imageBox}>
                                            {images[index] ? (
                                                <Image source={{ uri: images[index] }} style={styles.capturedImage} />
                                            ) : (
                                                <View style={styles.placeholder}>
                                                    <Text style={styles.placeholderText}>Image {index + 1}</Text>
                                                </View>
                                            )}
                                        </View>
                                    ))}
                                </View>
                            </>
                        )}
                        {savedSignature && (
                            <>
                                <Text style={styles.title}>Customer Signature:</Text>
                                <View style={styles.signatureContainer}>
                                    <Image source={{ uri: savedSignature }} style={styles.signatureImage} />
                                </View>
                            </>
                        )}
                        <TouchableOpacity style={styles.button} onPress={handleConfirm}>
                            <Text style={styles.buttonText}>Confirm</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#f2f2f2',
    },
    stepContainer: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 5 },
        elevation: 3,
        flex: 1
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#333',
    },
    input: {
        height: 40,
        borderColor: '#ddd',
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 10,
        marginBottom: 20,
        backgroundColor: '#fff',
    },
    imagesContainer: {
        flexDirection: 'row',
        flexWrap: "wrap",
        // justifyContent: 'space-between',
        marginBottom: 15,
    },
    imageBox: {
        width: '30%',
        aspectRatio: 1,
        margin: 4.5,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 5,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f2f2f2',
    },
    capturedImage: {
        width: '100%',
        height: '100%',
        borderRadius: 5,
    },
    placeholder: {
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100%',
    },
    placeholderText: {
        color: '#aaa',
        fontSize: 12,
    },

    signatureContainer: {
        marginTop: 15,
        alignItems: 'center',
    },
    signatureImage: {
        width: 300,
        height: 200,
        borderColor: '#000',
        borderWidth: 1,
    },
    scrollContainer: {
        flexGrow: 1,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 20,
    },
    button: {
        backgroundColor: '#007bff',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        alignItems: 'center',
        marginTop: 15,
    },
    disableButton: {
        backgroundColor: '#f5f3ed',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        alignItems: 'center',
        marginTop: 15,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
    },
    text: {
        fontSize: 16,
        color: '#333',
        marginBottom: 5,
    },
});

export default DeliveryConfirmationScreen;