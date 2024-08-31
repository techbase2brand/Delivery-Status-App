import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const OrderStatusScreen = () => {
    const [orders, setOrders] = useState([]);
    const [confirmedOrderIds, setConfirmedOrderIds] = useState([]);
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
        // const fetchOrders = async () => {
        //     try {
        //         const response = await fetch('https://your-shopify-store.myshopify.com/admin/api/2024-07/orders.json', {
        //             method: 'GET',
        //             headers: {
        //                 'Content-Type': 'application/json',
        //                 'X-Shopify-Access-Token': 'your-shopify-admin-access-token'
        //             }
        //         });
        
        //         if (!response.ok) {
        //             throw new Error('Failed to fetch orders');
        //         }
        
        //         const data = await response.json();
        //         setOrders(data.orders);
        //     } catch (error) {
        //         console.error('Error fetching orders:', error);
        //     } finally {
        //         setLoading(false);
        //     }
        // };
        const demoOrders = [
            {
                id: 'order1',
                name: 'Order #1001',
                fulfillmentStatus: 'Delivered',
                lineItems: {
                    edges: [
                        { node: { title: 'Product 1', quantity: 2 } },
                        { node: { title: 'Product 2', quantity: 1 } },
                    ]
                }
            },
            {
                id: 'order2',
                name: 'Order #1002',
                fulfillmentStatus: 'In Transit',
                lineItems: {
                    edges: [
                        { node: { title: 'Product 3', quantity: 1 } },
                        { node: { title: 'Product 4', quantity: 4 } },
                    ]
                }
            },
            {
                id: 'order3',
                name: 'Order #1003',
                fulfillmentStatus: 'Pending',
                lineItems: {
                    edges: [
                        { node: { title: 'Product 5', quantity: 3 } },
                    ]
                }
            }
        ];
        setOrders(demoOrders);
    }, []);


    const handleConfirmDelivery = async (orderId) => {
        await AsyncStorage.setItem('currentOrderId', orderId);
        const selectedOrder = orders.find(order => order.id === orderId);
        if (selectedOrder) {
            navigation.navigate('DeliveryConfirmation', { order: selectedOrder });
        } else {
            console.error('Order not found');
        }
    };


    
    const renderOrderItem = ({ item }) => (
        <View style={styles.orderItemContainer}>
            <Text style={styles.orderTitle}>{item.name}</Text>
            {/* <Text>Status: {item.fulfillmentStatus}</Text> */}
            <FlatList
                data={item.lineItems.edges}
                keyExtractor={(item) => item.node.title}
                renderItem={({ item }) => (
                    <Text>Title : {item.node.title} - Quantity: {item.node.quantity}</Text>
                )}
            />
            <TouchableOpacity
                style={styles.confirmButton}
                onPress={() => handleConfirmDelivery(item.id)}
                // disabled={confirmedOrderIds.includes(item.id)}
            >
                {/* <Text style={styles.confirmButtonText}>{orderConfirmed ? "Confirmed" : "Confirm Delivery"}</Text> */}
                <Text style={styles.confirmButtonText}>
                    {confirmedOrderIds.includes(item.id) ? "Confirmed" : "Confirm Delivery"}
                </Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={orders}
                keyExtractor={(item) => item.id}
                renderItem={renderOrderItem}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#f5f3ed',
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
});

export default OrderStatusScreen;
