import { useEffect ,useState, useContext } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { SIZES, COLORS } from '@/constants';
import HeaderWithGoBack from '@/components/header-with-go-back';
import FaqItem from '@/components/settings/faq-item';
import faqdata from '@/constants/faqdata';
import { useNavigation } from 'expo-router';
import i18n from '@/constants/i18n';

const FaqScreen = () => {
    const [data, setData] = useState([]);
    const navigation=useNavigation()
    useEffect(() => {
        setData(faqdata);
    }, []);
    return (
        <View style={styles.container}>
            <HeaderWithGoBack title="F.A.Q" navigation={navigation} />
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={{gap: 10}}>
                {
                    data.map((d) => (
                        <FaqItem key={d.id} question={i18n.t(d.question)} response={i18n.t(d.response)} list={d.list ? d.list : ""} />
                    ))
                }
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 20,
        flex: 1,
        backgroundColor: COLORS.neutral100
    },
    header: {
        marginTop: 40,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between"
    },
    medium: {
        fontFamily: "Medium",
        fontSize: SIZES.medium
    },
})

export default FaqScreen;