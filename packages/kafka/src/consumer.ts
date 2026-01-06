import type { Kafka, Consumer } from "kafkajs";

export const createConsumer = (kafka: Kafka, groupId: string) => {
  const consumer: Consumer = kafka.consumer({ groupId });

  const connect = async () => {
    await consumer.connect();
    console.log("Kafka consumer connected:" + groupId);
  };

  const subscribe = async (
    topics: {
      topicName: string;
      topicHandler: (message: any) => Promise<void>;
    }[]
  ) => {
    // Subscribe to each topic individually (KafkaJS requirement)
    for (const t of topics) {
      await consumer.subscribe({ topic: t.topicName, fromBeginning: true });
    }
    // await consumer.subscribe({
    //   topics: topics.map((topic) => topic.topicName),
    //   fromBeginning: true,
    // });

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const topicConfig = topics.find((t) => t.topicName === topic);
          if (!topicConfig) return;
          const raw = message.value?.toString();
          if (!raw) return;
          let parsed;
          try {
            parsed = JSON.parse(raw);
          } catch (err) {
            console.error("Invalid JSON received:", raw);
            return;
          }
          await topicConfig.topicHandler(parsed);
        } catch (error) {
          console.log("Error processing message", error);
        }
      },
    });
  };

  const disconnect = async () => {
    await consumer.disconnect();
  };

  return { connect, subscribe, disconnect };
};
