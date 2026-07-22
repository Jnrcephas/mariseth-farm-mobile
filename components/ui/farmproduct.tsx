import { colors } from "@/constants/colors";
import { icons } from "@/constants/icons";
import { farmProduct } from "@/types/farm";
import { Image } from "expo-image";
import { StyleSheet, View } from "react-native";
import AppText from "./apptext";

const FarmProduct = ({
  products,
  type,
  showTitle = true,
}: {
  products: farmProduct[];
  type: "livestock" | "crop";
  showTitle?: boolean;
}) => {
  if (!products?.length) return null;

  const types = {
    livestock: {
      title: "Livestock",
    },
    crop: { title: "Crops" },
  };

  return (
    <>
      {showTitle ? (
        <AppText
          fontFamily="SemiBold"
          fontSize={16}
          color="textBold"
          style={styles.sectionTitle}
        >
          {types[type].title}
        </AppText>
      ) : null}
      <View style={styles.productsContainer}>
        {products.map((product) => (
          <View style={styles.cropCard} key={product?.id}>
            <Image
              source={icons.phone}
              style={styles.productIcon}
              tintColor={colors.buttonPrimary}
            />
            <AppText fontFamily="Medium" fontSize={14} color="textBold">
              {product?.product?.name}
            </AppText>
          </View>
        ))}
      </View>
    </>
  );
};

export default FarmProduct;

const styles = StyleSheet.create({
  sectionTitle: {
    marginBottom: 12,
  },
  productsContainer: {
    width: "100%",
    gap: 8,
    marginBottom: 20,
  },
  cropCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
    width: "100%",
    minHeight: 50,
    paddingVertical: 13,
    paddingHorizontal: 31,
    backgroundColor: colors.backgroundPrimary,
    borderRadius: 12,
    shadowColor: "rgba(63, 30, 87, 0.10)",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 19,
    elevation: 4,
  },
  productIcon: {
    width: 24,
    height: 24,
  },
});
