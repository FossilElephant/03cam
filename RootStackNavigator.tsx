import { createNativeStackNavigator } from "@react-navigation/native-stack";
import PermissionsScreen from "@/screens/PermissionsScreen";
import CameraScreen from "@/screens/CameraScreen";
import SettingsScreen from "@/screens/SettingsScreen";
import GalleryScreen from "@/screens/GalleryScreen";

export type RootStackParamList = {
  Permissions: undefined;
  Camera: undefined;
  Settings: undefined;
  Gallery: { photos: string[] };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Permissions" component={PermissionsScreen} />
      <Stack.Screen name="Camera" component={CameraScreen} />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          presentation: "modal",
          headerShown: true,
          headerTitle: "Settings",
          headerStyle: { backgroundColor: "#0D1F17" },
          headerTintColor: "#FFFFFF",
        }}
      />
      <Stack.Screen
        name="Gallery"
        component={GalleryScreen}
        options={{
          presentation: "fullScreenModal",
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
}
