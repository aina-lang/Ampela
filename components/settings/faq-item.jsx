import { useState} from 'react';
import { Text, View, StyleSheet, Pressable, Image } from 'react-native';
import { COLORS, SIZES, icons } from '@/constants';
import i18n from '@/constants/i18n';
import { preferenceState } from '@/legendstate/AmpelaStates';
import { useSelector } from '@legendapp/state/react';
import { Ionicons } from '@expo/vector-icons';


const FaqItem = ({question, response, list}) => {
    const { theme, language } = useSelector(() => preferenceState.get());
    const [active, setActive] = useState(false);

    const cardBg = theme === "pink" ? COLORS.neutral100 : COLORS.neutral280;
    const cardBorder = theme === "pink" ? "#F0C8C8" : "#E8D5C4";
   
    const handlePress = () => {
        setActive(a => !a);
    }
    
    return (
        <Pressable onPress={handlePress} style={[styles.container, { backgroundColor: cardBg, borderColor: cardBorder }]}>
            <View style={styles.headerRow}>
                <View style={styles.questionWrapper}>
                    <Text style={[styles.question, { color: COLORS.primary }]}>{question}</Text>
                </View>
                <View style={{
                    transform: [
                        {rotateZ: active ? "180deg" : "0deg"}
                    ]
                }}>
                    <Ionicons name="chevron-down" size={18} color={COLORS.neutral400} />
                </View>
            </View>    
           {
                active ?
                (   
                <View style={styles.answerContainer}>
                    <View style={[styles.divider, { backgroundColor: cardBorder }]} />
                    <Text style={[styles.response, { color: COLORS.neutral400 }]}>{response}</Text>  
                    {list ? list.map((d,index) => <Text key={index} style={[styles.response, { color: COLORS.neutral400 }]}>- {i18n.t(d)}</Text>) : null}
                </View>                  
                )
                   
                 :
                null
            } 
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 16,
        borderWidth: 1,
        paddingHorizontal: 16,
        marginBottom: 12,
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
