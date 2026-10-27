import { useState} from 'react';
import { Text, View, StyleSheet, Pressable } from 'react-native';
import { COLORS, SIZES } from '@/constants';
import i18n from '@/constants/i18n';
import { useDiscoveryTheme } from '@/components/discovery';
import { Ionicons } from '@expo/vector-icons';
import DiscoveryCard from '@/components/discovery/DiscoveryCard';


const FaqItem = ({question, response, list}) => {
    const { surface, accentColor } = useDiscoveryTheme();
    const [active, setActive] = useState(false);

    const handlePress = () => {
        setActive(a => !a);
    }
    
    return (
        <DiscoveryCard style={styles.container}>
            <Pressable onPress={handlePress} style={styles.pressable}>
                <View style={styles.headerRow}>
                    <View style={styles.questionWrapper}>
                        <Text style={[styles.question, { color: COLORS.primary }]}>{question}</Text>
                    </View>
                    <View style={{
                        transform: [
                            {rotateZ: active ? "180deg" : "0deg"}
                        ]
                    }}>
                        <Ionicons name="chevron-down" size={18} color={accentColor} />
                    </View>
                </View>    
               {
                    active ?
                    (   
                    <View style={styles.answerContainer}>
                        <View style={styles.divider} />
                        <Text style={[styles.response, { color: COLORS.neutral400 }]}>{response}</Text>  
                        {list ? list.map((d,index) => <Text key={index} style={[styles.response, { color: COLORS.neutral400 }]}>- {i18n.t(d)}</Text>) : null}
                    </View>                  
                    )
                    
                     :
                    null
                } 
            </Pressable>
        </DiscoveryCard>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 12,
    },
    pressable: {
        flex: 1,
    },
    headerRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 16,
    },
    questionWrapper: {
        flex: 1,
        marginRight: 12,
    },
    question: {
        fontFamily: "SBold",
        fontSize: SIZES.small,
    },
    answerContainer: {
        paddingBottom: 16,
    },
    divider: {
        height: 1,
        backgroundColor: "#F0F0F0",
        marginBottom: 12,
    },
    response: {
        fontFamily: "Regular",
        fontSize: SIZES.small,
        lineHeight: 20,
        marginBottom: 4,
    }
})

export default FaqItem;
