// import React, { useCallback, useEffect, useState } from 'react';
// import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
// import { useFocusEffect, useNavigation } from '@react-navigation/native';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// const OrderStatusScreen = () => {
//     const [orders, setOrders] = useState([]);
//     const [confirmedOrderIds, setConfirmedOrderIds] = useState([]);
//     const navigation = useNavigation();
//     useFocusEffect(
//         useCallback(() => {
//             const fetchConfirmedOrders = async () => {
//                 try {
//                     const value = await AsyncStorage.getItem('confirmedOrders');
//                     if (value !== null) {
//                         setConfirmedOrderIds(JSON.parse(value));
//                     }
//                 } catch (error) {
//                     console.error('Error retrieving item from storage:', error);
//                 }
//             };

//             fetchConfirmedOrders();
//         }, [])
//     );
//     

//     const handleConfirmDelivery = async (orderId) => {
//         try {
//             await AsyncStorage.setItem('currentOrderId', orderId.toString());
//             const selectedOrder = orders.find(order => order.id === orderId);
//             if (selectedOrder) {
//                 navigation.navigate('DeliveryConfirmation', { order: selectedOrder });
//             } else {
//                 console.error('Order not found');
//             }
//         } catch (error) {
//             console.error('Error confirming delivery:', error);
//         }
//     };



//     const renderOrderItem = ({ item }) => {
//         console.log(item);

//         return (
//             <View style={styles.orderItemContainer}>
//                 <Text style={styles.orderTitle}>Order: {item.name}</Text>
//                 {/* <Text>Order Number: {item.order_number}</Text> */}
//                 <FlatList
//                     data={item.line_items}
//                     keyExtractor={(lineItem) => lineItem.id.toString()}
//                     renderItem={({ item: lineItem }) => (
//                         <View style={styles.lineItemContainer}>
//                             <Text style={styles.lineItemTitle}>{lineItem.title}</Text>
//                             <Text style={styles.lineItemQuantity}>Quantity: {lineItem.quantity}</Text>
//                         </View>
//                     )}
//                     contentContainerStyle={styles.lineItemList}
//                 />
//                 {/* <Text>Total Price: {item.total_price} {item.currency}</Text> */}
//                 <TouchableOpacity
//                     style={[
//                         styles.confirmButton,
//                         confirmedOrderIds.includes(item.id)
//                             ? { backgroundColor: "red" }
//                             : { backgroundColor: "#42A5F5" }
//                     ]}
//                     onPress={() => handleConfirmDelivery(item.id)}
//                 >
//                     <Text style={styles.confirmButtonText}>
//                         {confirmedOrderIds.includes(item.id)
//                             ? "Confirmed"
//                             : "Confirm Delivery"}
//                     </Text>
//                 </TouchableOpacity>
//             </View>
//         );
//     };


//     return (
//         <View style={styles.container}>
//             <FlatList
//                 data={orders}
//                 keyExtractor={(item) => item.id}
//                 renderItem={renderOrderItem}
//             />
//         </View>
//     );
// };

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         padding: 16,
//         backgroundColor: '#f5f3ed',
//     },
//     orderItemContainer: {
//         backgroundColor: '#fff',
//         padding: 16,
//         borderRadius: 8,
//         marginBottom: 16,
//         elevation: 2,
//     },
//     orderTitle: {
//         fontSize: 18,
//         fontWeight: 'bold',
//         marginBottom: 8,
//     },
//     confirmButton: {
//         marginTop: 16,
//         backgroundColor: '#42A5F5',
//         paddingVertical: 12,
//         borderRadius: 8,
//         alignItems: 'center',
//     },
//     confirmButtonText: {
//         color: '#fff',
//         fontSize: 16,
//     },
//     lineItemContainer: {
//         paddingVertical: 12,
//         paddingHorizontal: 16,
//         borderBottomWidth: 1,
//         borderBottomColor: '#eee',
//         backgroundColor: '#fafafa',
//     },
//     lineItemTitle: {
//         fontSize: 16,
//         fontWeight: '500',
//         color: '#333',
//     },
//     lineItemQuantity: {
//         fontSize: 14,
//         color: '#666',
//     },
//     lineItemList: {
//         borderTopWidth: 1,
//         borderTopColor: '#ddd',
//         marginVertical: 8,
//     },
// });

// export default OrderStatusScreen;


import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Modal, Button } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { SHOPIFY_ACCESS_TOKEN, STORE_DOMAIN } from '../Constants/constant';

const OrderStatusScreen = () => {
    const [orders, setOrders] = useState([]);
    const [confirmedOrderIds, setConfirmedOrderIds] = useState([]);
    const [showPicker, setShowPicker] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [filteredOrders, setFilteredOrders] = useState([]);
    const navigation = useNavigation();

    useFocusEffect(
        useCallback(() => {
            const fetchConfirmedOrders = async () => {
                try {
                    const value = await AsyncStorage.getItem('confirmedOrders');
                    if (value !== null) {
                        setConfirmedOrderIds(JSON.parse(value));
                    }
                } catch (error) {
                    console.error('Error retrieving item from storage:', error);
                }
            };

            fetchConfirmedOrders();
        }, [])
    );

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await fetch(`https://${STORE_DOMAIN}/admin/api/2024-07/orders.json`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN
                    }
                });
                const data = await response.json();
                setOrders(data.orders);
                setFilteredOrders(data.orders); // Initialize filteredOrders with all orders
            } catch (error) {
                console.error('Error fetching orders:', error);
            }
        };
        fetchOrders();
    }, []);

    useEffect(() => {
        const filterOrdersByDate = () => {
            const startOfDay = new Date(selectedDate.setHours(0, 0, 0, 0));
            const endOfDay = new Date(selectedDate.setHours(23, 59, 59, 999));
            const filtered = orders.filter(order => {
                const orderDate = new Date(order.created_at); // Replace 'created_at' with your actual date field
                return orderDate >= startOfDay && orderDate <= endOfDay;
            });
            setFilteredOrders(filtered);
        };
        filterOrdersByDate();
    }, [selectedDate, orders]);

    const handleConfirmDelivery = async (orderId) => {
        try {
            await AsyncStorage.setItem('currentOrderId', orderId.toString());
            const selectedOrder = orders.find(order => order.id === orderId);
            if (selectedOrder) {
                navigation.navigate('DeliveryConfirmation', { order: selectedOrder });
            } else {
                console.error('Order not found');
            }
        } catch (error) {
            console.error('Error confirming delivery:', error);
        }
    };

    const onDateChange = (event, date) => {
        if (date) {
            setSelectedDate(date);
        }
        setShowPicker(false);
    };

    const openDatePicker = () => {
        setShowPicker(true);
    };

    const formatDate = (date) => {
        const day = date.getDate();
        const month = date.getMonth() + 1; // Months are zero-based
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const renderOrderItem = ({ item }) => {
        // console.log(item);

        return (
            <View style={styles.orderItemContainer}>
                <Text style={styles.orderTitle}>Order: {item.name}</Text>
                <FlatList
                    data={item.line_items}
                    keyExtractor={(lineItem) => lineItem.id.toString()}
                    renderItem={({ item: lineItem }) => (
                        <View style={styles.lineItemContainer}>
                            <Text style={styles.lineItemTitle}>Product Name: {lineItem.title}</Text>
                            <Text style={styles.lineItemQuantity}>Quantity: {lineItem.quantity}</Text>
                        </View>
                    )}
                    contentContainerStyle={styles.lineItemList}
                />
                <TouchableOpacity
                    style={[
                        styles.confirmButton,
                        confirmedOrderIds.includes(item.id)
                            ? { backgroundColor: "red" }
                            : { backgroundColor: "#42A5F5" }
                    ]}
                    onPress={() => handleConfirmDelivery(item.id)}
                >
                    <Text style={styles.confirmButtonText}>
                        {confirmedOrderIds.includes(item.id)
                            ? "Confirmed"
                            : "Confirm Delivery"}
                    </Text>
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.datePickerContainer}>
                <View style={{ width: "60%", borderColor: "black", borderWidth: 1, paddingVertical: 11, borderRadius: 8, marginRight: 16, paddingLeft: 14 }}>
                    <Text style={styles.selectedDateText}>{formatDate(selectedDate)}</Text>
                </View>
                <TouchableOpacity style={styles.dateButton} onPress={openDatePicker}>
                    <Text style={styles.dateButtonText}>Select Date</Text>
                </TouchableOpacity>
            </View>
            {filteredOrders.length > 0 ? (
                <FlatList
                    data={filteredOrders}
                    keyExtractor={(item) => item.id}
                    renderItem={renderOrderItem}
                    showsVerticalScrollIndicator={false}
                />
            ) : (
                <View style={styles.noOrdersContainer}>
                    <Text style={styles.noOrdersText}>No orders available for the selected date.</Text>
                </View>
            )}
            {showPicker && (
                <DateTimePicker
                    value={selectedDate}
                    mode='date'
                    display='default'
                    onChange={onDateChange}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#f5f3ed',
    },
    datePickerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16
    },
    dateButton: {
        backgroundColor: '#42A5F5',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        flex: 1,
    },
    dateButtonText: {
        color: '#fff',
        fontSize: 16,
    },
    selectedDateText: {
        fontSize: 16,
        color: '#333',
    },
    orderItemContainer: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 8,
        marginBottom: 16,
        elevation: 2,
    },
    orderTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    confirmButton: {
        marginTop: 16,
        backgroundColor: '#42A5F5',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    confirmButtonText: {
        color: '#fff',
        fontSize: 16,
    },
    lineItemContainer: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        backgroundColor: '#fafafa',
    },
    lineItemTitle: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
    },
    lineItemQuantity: {
        fontSize: 14,
        color: '#666',
    },
    lineItemList: {
        borderTopWidth: 1,
        borderTopColor: '#ddd',
        marginVertical: 8,
    },
    noOrdersContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    noOrdersText: {
        fontSize: 18,
        color: '#666',
        textAlign: "center"
    },
});

export default OrderStatusScreen;
