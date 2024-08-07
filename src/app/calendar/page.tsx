"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { parseISO, format } from "date-fns";
import { fromZonedTime, toZonedTime } from "date-fns-tz";
import { useRouter } from "next/navigation";
import {
  Box,
  Spinner,
  Flex,
  Text,
  useToast,
  Heading,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  useMediaQuery,
} from "@chakra-ui/react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import esLocale from "@fullcalendar/core/locales/es";
import EventForm from "../_components/EventForm/EventForm";
import "./fullcalendar.css";
import { MEDIA_QUERIES } from "../_constants/mediaQueries";

interface EventInput {
  title: string;
  start: string;
  end: string;
}

const CalendarPage = () => {
  const [isFetching, setIsFetching] = useState(false);
  const [events, setEvents] = useState<EventInput[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<{ start: string } | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const toast = useToast();
  const router = useRouter();

  const [isSmallScreen] = useMediaQuery(MEDIA_QUERIES.sm);
  const [isMediumScreen] = useMediaQuery(MEDIA_QUERIES.md);

  useEffect(() => {
    const fetchEvents = async () => {
      setIsFetching(true);
      try {
        const response = await axios.get("/api/calendar-events");
        const events = response.data.map((event: any) => {
          const startUTC = parseISO(event.start.dateTime || event.start.date);
          const endUTC = parseISO(event.end.dateTime || event.end.date);

          // Convert UTC times to local time zone
          const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
          const startLocal = toZonedTime(startUTC, userTimeZone);
          const endLocal = toZonedTime(endUTC, userTimeZone);

          console.log(
            "Fetched event start:",
            startLocal,
            "end:",
            endLocal,
            "in time zone:",
            userTimeZone
          );

          return {
            title: "Ocupado",
            start: format(startLocal, "yyyy-MM-dd'T'HH:mm:ssxxx"),
            end: format(endLocal, "yyyy-MM-dd'T'HH:mm:ssxxx"),
          };
        });
        setEvents(events);
      } catch (error) {
        console.error("Error fetching calendar events:", error);
      } finally {
        setIsFetching(false);
      }
    };

    fetchEvents();
  }, []);

  const handleDateSelect = (selectInfo: any) => {
    console.log("Date selected:", selectInfo.startStr);
    setSelectedEvent({
      start: selectInfo.startStr,
    });
    setIsModalOpen(true); // Show the modal
  };

  const handleCreateEvent = async (newEvent: {
    summary: string;
    email: string;
    phone: string;
    reason?: string;
    start: string;
    end: string;
  }) => {
    try {
      // Convert local times to UTC
      const startUtc = fromZonedTime(
        newEvent.start,
        "America/Mexico_City"
      ).toISOString();
      const endUtc = fromZonedTime(
        newEvent.end,
        "America/Mexico_City"
      ).toISOString();

      const response = await axios.post("/api/calendar-events", {
        ...newEvent,
        start: startUtc,
        end: endUtc,
      });
      setEvents((prevEvents) => [...prevEvents, response.data]);
      toast({
        title: "Evento creado.",
        description: "Se ha añadido el evento al calendario.",
        status: "success",
        duration: 5000,
        isClosable: true,
        render: () => (
          <Box color="#FFFFF0" p={3} bg="#de6b48" borderRadius="md">
            Evento creado. Se ha añadido el evento al calendario.
          </Box>
        ),
      });
      setIsModalOpen(false);
      setIsConfirmationOpen(true);
    } catch (error) {
      console.error("Error creating event:", error);
      toast({
        title: "Error",
        description: "Intenta otra vez, ocurrió un error al crear el evento.",
        status: "error",
        duration: 5000,
        isClosable: true,
        render: () => (
          <Box color="#FFFFF0" p={3} bg="#800020" borderRadius="md">
            Error al crear el evento. Intenta de nuevo.
          </Box>
        ),
      });
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  const handleCloseConfirmation = () => {
    setIsConfirmationOpen(false);
    router.push("/about");
  };

  return (
    <Box
      position="relative"
      minHeight="calc(100vh - 48px)"
      overflow="hidden"
      px={4}
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      className="fade-in"
      pb={24}
    >
      <Heading
        as="h1"
        mb={{ base: 4, md: 8, lg: 24 }}
        color="#f4e8c1"
        fontFamily="roca"
        fontSize={{ base: "3em", xl: "6em" }}
        textAlign={{ base: "center", md: "center" }}
      >
        Selecciona un horario a tu conveniencia
      </Heading>
      {isFetching ? (
        <Flex
          width="60%"
          height={isSmallScreen ? "66vh" : "56vh"}
          bg="#D8C3A5"
          boxShadow="lg"
          borderRadius="md"
          p={4}
          overflow="hidden"
          justify="center"
          align="center"
        >
          <Spinner />
        </Flex>
      ) : (
        <Box
          width={{ base: "98vw", md: "100%", lg: "80%", xl: "60%" }}
          height={isSmallScreen ? "66vh" : "56vh"}
          bg="#D8C3A5"
          boxShadow="lg"
          borderRadius="md"
          p={4}
          overflowX="auto" // Enable horizontal scrolling on mobile
        >
          <FullCalendar
            timeZone="local"
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView={isSmallScreen ? "customTwoDay" : "timeGridWeek"}
            views={{
              customTwoDay: {
                type: "timeGrid",
                duration: { days: 2 },
                buttonText: "2 días",
              },
            }}
            events={events}
            selectable={true}
            select={handleDateSelect}
            height="100%"
            locale={esLocale}
            headerToolbar={{
              left: isSmallScreen ? "prev,next" : "prev,next today",
              center: "title",
              right: isSmallScreen
                ? "customTwoDay"
                : "dayGridMonth,timeGridWeek,timeGridDay",
            }}
            slotMinTime="07:00:00"
            slotMaxTime="22:00:00"
            slotLabelFormat={{
              hour: "2-digit",
              minute: "2-digit",
              meridiem: "short",
            }}
            slotDuration="01:00:00"
            slotLabelInterval="01:00"
            eventTimeFormat={{
              hour: "2-digit",
              minute: "2-digit",
              meridiem: "short",
            }}
            hiddenDays={[0, 6]}
            businessHours={{
              daysOfWeek: [1, 2, 3, 4, 5],
              startTime: "08:00",
              endTime: "17:00",
            }}
            allDaySlot={false}
            dayCellContent={(arg) => (
              <Flex align="center" justify="center" height="100%">
                {arg.dayNumberText}
              </Flex>
            )}
            eventContent={(eventInfo) => (
              <Flex
                align="center"
                justify="center"
                borderRadius="md"
                height="100%"
                p={1}
                fontSize={isSmallScreen ? "2.4em" : "1.5em"}
                lineHeight={isSmallScreen ? "3em" : "2em"}
              >
                <Text>Ocupado</Text>
              </Flex>
            )}
            selectAllow={(selectInfo) => {
              return true;
            }}
            longPressDelay={100} // Reducing long press delay for better responsiveness
            selectLongPressDelay={100} // Reducing long press delay for selection
          />
        </Box>
      )}
      {selectedEvent && (
        <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
          <ModalOverlay />
          <ModalContent top="20%" bg="#FFFFF0">
            <ModalHeader color="#2c3e50">Crear Evento</ModalHeader>
            <ModalCloseButton color="#2c3e50" />
            <ModalBody>
              <EventForm
                start={selectedEvent.start}
                onCreateEvent={handleCreateEvent}
                onClose={handleCloseModal}
              />
            </ModalBody>
          </ModalContent>
        </Modal>
      )}
      {isConfirmationOpen && (
        <Modal isOpen={isConfirmationOpen} onClose={handleCloseConfirmation}>
          <ModalOverlay />
          <ModalContent top="20%" bg="#FFFFF0">
            <ModalHeader color="#2c3e50">Confirmación</ModalHeader>
            <ModalCloseButton color="#2c3e50" />
            <ModalBody>
              <Text color="#2c3e50" mb={4}>
                Tu cita se ha programado. Checa tu correo electrónico para más
                información.
              </Text>
              <Text color="#2c3e50" mb={2}>
                Si tienes una cuenta de Gmail, también recibirás una invitación
                al evento.
              </Text>
              <Text color="#2c3e50" mb={2}>
                Revisa tu bandeja de entrada y la carpeta de spam. Si no recibes
                el correo, te enviaremos otro correo con los detalles y el
                enlace de Google Meet.
              </Text>
              <Button
                width="100%"
                mb={2}
                bg="#de6b48"
                color="#ffffff"
                _hover={{
                  bg: "#2c3e50",
                  color: "white",
                }}
                onClick={handleCloseConfirmation}
              >
                Aceptar
              </Button>
            </ModalBody>
          </ModalContent>
        </Modal>
      )}
    </Box>
  );
};

export default CalendarPage;
